import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestimonialsService, Testimonial } from '../../services/testimonials.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css']
})
export class TestimonialsComponent implements OnInit {
  testimonials: Testimonial[] = [];
  loading = true;
  saving = false;
  deleting: number | null = null;
  
  // Form model
  testimonialModel: Testimonial = {
    name: '',
    message: '',
    social_icon: '',
    profile_image: '',
    is_active: true
  };
  
  // File upload states
  uploadingProfile = false;
  uploadingSocial = false;
  
  // Edit state
  // (update/edit removed) Form always binds to testimonialModel

  constructor(private testimonialsService: TestimonialsService) {}

  async ngOnInit() {
    await this.loadTestimonials();
  }

  async loadTestimonials() {
    try {
      this.loading = true;
      this.testimonials = await this.testimonialsService.getAllTestimonials();
  } catch (error: any) {
      console.error('Error loading testimonials:', error);
      await Swal.fire('Error', 'Failed to load testimonials', 'error');
    } finally {
      this.loading = false;
    }
  }

  async addTestimonial() {
    if (!this.testimonialModel.name.trim() || !this.testimonialModel.message.trim()) {
      await Swal.fire('Error', 'Name and message are required', 'error');
      return;
    }

    try {
      this.saving = true;
      await this.testimonialsService.createTestimonial(this.testimonialModel);
      await Swal.fire('Success', 'Testimonial added successfully', 'success');
      this.resetForm();
      await this.loadTestimonials();
  } catch (error: any) {
      console.error('Error adding testimonial:', error);
      // Extract useful message from Supabase/PostgREST error
      let message = 'Failed to add testimonial';
      try {
        if (error?.message) message = error.message;
        else if (error?.error?.message) message = error.error.message;
        else if (typeof error === 'string') message = error;
        else message = JSON.stringify(error);
      } catch (e) {
        // ignore
      }
      await Swal.fire('Error', message, 'error');
    } finally {
      this.saving = false;
    }
  }


  async deleteTestimonial(id: number) {
    const result = await Swal.fire({
      title: 'Delete Testimonial?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    });

    if (!result.isConfirmed) return;

    try {
      this.deleting = id;
      await this.testimonialsService.deleteTestimonial(id);
      await Swal.fire('Deleted', 'Testimonial deleted successfully', 'success');
      await this.loadTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      await Swal.fire('Error', 'Failed to delete testimonial', 'error');
    } finally {
      this.deleting = null;
    }
  }

  editTestimonial(testimonial: Testimonial) {
    // edit functionality removed
    // kept as a no-op to avoid accidental calls; prefer add/delete only
    return;
  }
  

  resetForm() {
    this.testimonialModel = {
      name: '',
      message: '',
      social_icon: '',
      profile_image: '',
      is_active: true
    };
    
    // Reset file inputs
    const profileInput = document.getElementById('profileImage') as HTMLInputElement;
    const socialInput = document.getElementById('socialIcon') as HTMLInputElement;
    if (profileInput) profileInput.value = '';
    if (socialInput) socialInput.value = '';
  }

  // Profile image upload
  async onProfileImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      await Swal.fire('Invalid File', 'Please select an image file', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      await Swal.fire('File Too Large', 'Image must be less than 2MB', 'error');
      return;
    }

    try {
      this.uploadingProfile = true;
      const url = await this.testimonialsService.uploadProfileImage(file);
  // assign to the add form model
  this.testimonialModel.profile_image = url;
      await Swal.fire('Success', 'Profile image uploaded successfully', 'success');
    } catch (error:any) {
      console.error('Error uploading profile image:', error);
      const message = error?.message || 'Failed to upload profile image';
      await Swal.fire('Error', message, 'error');
    } finally {
      this.uploadingProfile = false;
    }
  }

  // Social media icon upload
  async onSocialIconSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      await Swal.fire('Invalid File', 'Please select an image file', 'error');
      return;
    }

    if (file.size > 1 * 1024 * 1024) { // 1MB limit
      await Swal.fire('File Too Large', 'Icon must be less than 1MB', 'error');
      return;
    }

    try {
      this.uploadingSocial = true;
      const url = await this.testimonialsService.uploadSocialIcon(file);
    // assign to the add form model
    this.testimonialModel.social_icon = url;
      await Swal.fire('Success', 'Social media icon uploaded successfully', 'success');
    } catch (error:any) {
      console.error('Error uploading social icon:', error);
      const message = error?.message || 'Failed to upload social media icon';
      await Swal.fire('Error', message, 'error');
    } finally {
      this.uploadingSocial = false;
    }
  }

  removeProfileImage() {
  // always clear add form model's profile image
  this.testimonialModel.profile_image = '';
    const profileInput = document.getElementById('profileImage') as HTMLInputElement;
    if (profileInput) profileInput.value = '';
  }

  removeSocialIcon() {
    // always clear add form model's social icon
    this.testimonialModel.social_icon = '';
    const socialInput = document.getElementById('socialIcon') as HTMLInputElement;
    if (socialInput) socialInput.value = '';
  }

  // Generate star rating display
  // rating removed — no star helper needed
}

