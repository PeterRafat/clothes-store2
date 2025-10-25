import { Injectable } from '@angular/core';
import { supabase } from '../supabaseClient';

export interface Testimonial {
  id?: number;
  name: string;
  message: string;
  social_icon?: string;
  profile_image?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TestimonialsService {

  constructor() { }

  // Get all active testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching testimonials:', error);
        throw error;
      }

      const rows: Testimonial[] = data || [];

      // If images are stored as storage paths (not full URLs) and bucket is private,
      // generate signed URLs on the fly so the frontend can display them.
      const bucket = 'testimonials-images';

      const enhanced = await Promise.all(rows.map(async (r) => {
        const copy = { ...r } as Testimonial;

        try {
          if (copy.profile_image && !/^https?:\/\//i.test(copy.profile_image)) {
            const { data: signedData, error: signedErr } = await supabase.storage
              .from(bucket)
              .createSignedUrl(copy.profile_image, 60 * 60);
            if (!signedErr && signedData && (signedData as any).signedUrl) {
              copy.profile_image = (signedData as any).signedUrl;
            }
          }

          if (copy.social_icon && !/^https?:\/\//i.test(copy.social_icon)) {
            const { data: signedData, error: signedErr } = await supabase.storage
              .from(bucket)
              .createSignedUrl(copy.social_icon, 60 * 60);
            if (!signedErr && signedData && (signedData as any).signedUrl) {
              copy.social_icon = (signedData as any).signedUrl;
            }
          }
        } catch (err) {
          console.warn('Error creating signed URL for testimonial image:', err);
        }

        return copy;
      }));

      return enhanced;
    } catch (error) {
      console.error('Error in getTestimonials:', error);
      throw error;
    }
  }

  // Get all testimonials (for admin)
  async getAllTestimonials(): Promise<Testimonial[]> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all testimonials:', error);
        throw error;
      }

      const rows: Testimonial[] = data || [];
      const bucket = 'testimonials-images';

      const enhanced = await Promise.all(rows.map(async (r) => {
        const copy = { ...r } as Testimonial;

        try {
          if (copy.profile_image && !/^https?:\/\//i.test(copy.profile_image)) {
            const { data: signedData, error: signedErr } = await supabase.storage
              .from(bucket)
              .createSignedUrl(copy.profile_image, 60 * 60);
            if (!signedErr && signedData && (signedData as any).signedUrl) {
              copy.profile_image = (signedData as any).signedUrl;
            }
          }

          if (copy.social_icon && !/^https?:\/\//i.test(copy.social_icon)) {
            const { data: signedData, error: signedErr } = await supabase.storage
              .from(bucket)
              .createSignedUrl(copy.social_icon, 60 * 60);
            if (!signedErr && signedData && (signedData as any).signedUrl) {
              copy.social_icon = (signedData as any).signedUrl;
            }
          }
        } catch (err) {
          console.warn('Error creating signed URL for testimonial image:', err);
        }

        return copy;
      }));

      return enhanced;
    } catch (error) {
      console.error('Error in getAllTestimonials:', error);
      throw error;
    }
  }

  // Create new testimonial
  async createTestimonial(testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>): Promise<Testimonial> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert([testimonial])
        .select()
        .single();

      if (error) {
        console.error('Error creating testimonial:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createTestimonial:', error);
      throw error;
    }
  }

  // Update testimonial
  async updateTestimonial(id: number, testimonial: Partial<Testimonial>): Promise<Testimonial> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .update(testimonial)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating testimonial:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateTestimonial:', error);
      throw error;
    }
  }

  // Delete testimonial
  async deleteTestimonial(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting testimonial:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteTestimonial:', error);
      throw error;
    }
  }

  // Upload profile image
  async uploadProfileImage(file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const bucket = 'testimonials-images';

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: false } as any);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Try public URL first
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (urlData && (urlData as any).publicUrl) {
        return (urlData as any).publicUrl;
      }

      // If bucket is private, create a signed URL (valid for 1 hour)
      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 60 * 60);

      if (signedError) {
        console.error('Signed URL error:', signedError);
        throw signedError;
      }

      if (signedData && (signedData as any).signedUrl) {
        return (signedData as any).signedUrl;
      }

      throw new Error('Failed to obtain URL for uploaded profile image');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }

  // Upload social media icon
  async uploadSocialIcon(file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `social-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `social/${fileName}`;

      const bucket = 'testimonials-images';

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: false } as any);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Try public URL first
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (urlData && (urlData as any).publicUrl) {
        return (urlData as any).publicUrl;
      }

      // If bucket is private, create a signed URL (valid for 1 hour)
      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 60 * 60);

      if (signedError) {
        console.error('Signed URL error:', signedError);
        throw signedError;
      }

      if (signedData && (signedData as any).signedUrl) {
        return (signedData as any).signedUrl;
      }

      throw new Error('Failed to obtain URL for uploaded social icon');
    } catch (error) {
      console.error('Error uploading social icon:', error);
      throw error;
    }
  }
}

