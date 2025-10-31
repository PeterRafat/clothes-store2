import { Injectable } from '@angular/core';
import { supabase } from '../supabaseClient';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  // PRODUCTS
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories ( name )')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getProductById(id: number | string) {
    const { data, error } = await supabase.from('products').select('*, categories ( name )').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async createProduct(product: any) {
    const { data, error } = await supabase.from('products').insert(product).select().single();
    if (error) throw error;
    return data;
  }

  async updateProduct(id: number | string, updates: any) {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteProduct(id: number | string) {
    const { data, error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return data;
  }

  // CATEGORIES
  async getCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });
    if (error) throw error;
    return data;
  }
  
  // Light-weight products preview for lists (only required fields)
  async getProductsPreview(limit: number = 12) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, image_url, price, subcategory_id')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  }

  // Get a small set of products for a given subcategory (used on home page)
  async getProductsBySubcategory(subcategoryId: number | string, limit: number = 8) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, image_url, price, subcategory_id')
      .eq('subcategory_id', subcategoryId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  }
  async createCategory(name: string) {
    const { data, error } = await supabase.from('categories').insert({ name }).select().single();
    if (error) throw error;
    return data;
  }
  async deleteCategory(id: number | string) {
    const { data, error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    return data;
  }

  // SUBCATEGORIES
  async getSubcategories() {
    const { data, error } = await supabase.from('subcategories').select('*').order('id', { ascending: true });
    if (error) throw error;
    return data;
  }

  async getSubcategoriesByCategory(categoryId: number | string) {
    const { data, error } = await supabase.from('subcategories').select('*').eq('category_id', categoryId).order('id', { ascending: true });
    if (error) throw error;
    return data;
  }

  async createSubcategory(name: string, category_id: number | string) {
    const { data, error } = await supabase.from('subcategories').insert({ name, category_id }).select().single();
    if (error) throw error;
    return data;
  }

  async deleteSubcategory(id: number | string) {
    const { data, error } = await supabase.from('subcategories').delete().eq('id', id);
    if (error) throw error;
    return data;
  }

  // Test admins table access
  async testAdminsTable() {
    try {
      console.log('SupabaseService: Testing admins table access...');
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .limit(1);
      
      console.log('SupabaseService: Admins table test result:', { data, error });
      return { success: !error, data, error };
    } catch (err) {
      console.error('SupabaseService: Admins table test error:', err);
      return { success: false, error: err };
    }
  }

  // SIMPLE ADMIN LOGIN (demo)
  // expects admins table with columns name, password (plain text for demo only)
  async loginAdmin(username: string, password: string) {
    console.log('SupabaseService: Attempting login with:', { username, password });
    
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('name', username)  // Changed from 'username' to 'name'
        .eq('password', password)
        .limit(1)
        .single();
      
      console.log('SupabaseService: Query result:', { data, error });
      
      if (error) {
        console.log('SupabaseService: Error details:', error);
        // if no row found, single() throws PGRST116; handle as null
        if (error.code === 'PGRST116') {
          console.log('SupabaseService: No admin found with these credentials');
          return null;
        }
        throw error;
      }
      
      console.log('SupabaseService: Login successful, admin data:', data);
      return data;
    } catch (err) {
      console.error('SupabaseService: Login error:', err);
      throw err;
    }
  }

  // ABOUT US
  async getAboutUs() {
    const { data, error } = await supabase
      .from('about_us')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return data;
  }

  async createAboutUs(aboutUs: any) {
    const { data, error } = await supabase
      .from('about_us')
      .insert(aboutUs)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateAboutUs(id: number | string, updates: any) {
    const { data, error } = await supabase
      .from('about_us')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteAboutUs(id: number | string) {
    const { data, error } = await supabase
      .from('about_us')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return data;
  }

  // PAYMENT POLICY
  async getPaymentPolicy() {
    const { data, error } = await supabase
      .from('payment_policy')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return data;
  }

  async createPaymentPolicy(policy: any) {
    const { data, error } = await supabase
      .from('payment_policy')
      .insert(policy)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updatePaymentPolicy(id: number | string, updates: any) {
    const { data, error } = await supabase
      .from('payment_policy')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deletePaymentPolicy(id: number | string) {
    const { data, error } = await supabase
      .from('payment_policy')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return data;
  }

  // RETURN POLICY
  async getReturnPolicy() {
    const { data, error } = await supabase
      .from('return_policy')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return data;
  }

  async createReturnPolicy(policy: any) {
    const { data, error } = await supabase
      .from('return_policy')
      .insert(policy)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateReturnPolicy(id: number | string, updates: any) {
    const { data, error } = await supabase
      .from('return_policy')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteReturnPolicy(id: number | string) {
    const { data, error } = await supabase
      .from('return_policy')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return data;
  }
}
