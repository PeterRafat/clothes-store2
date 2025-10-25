import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../supabaseClient';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  subcategories: any[] = [];
  productModel: any = {
    name: '', price: 0, priceBeforeOffer: null, image_url: '', gallery_images: [], color: '', quantity: 0, details: '', status: '', sizes: '', category_id: null
  };
  loading = true;
  editId: number | string | null = null;
  editModel: any = null;
  savingProduct: number | string | null = null;
  deletingProduct: number | string | null = null;
  uploadingImage = false;
  uploadingGallery = false;
  isDragOver = false;

  constructor(
    private sb: SupabaseService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadCategories();
    await this.loadProducts();
    this.subcategories = await this.sb.getSubcategories();
    console.log('Loaded categories:', this.categories);
    console.log('Loaded subcategories:', this.subcategories);
  }

  // when user selects a category in the Add Product form
  onCategoryChangeForNew(categoryId: number | string) {
    console.log('Category changed to:', categoryId);
    const subs = this.subsForCategory(categoryId);
    console.log('Available subcategories:', subs);
    this.productModel.subcategory_id = subs.length ? subs[0].id : null;
  }

  // when user changes category in the edit row
  onCategoryChangeForEdit() {
    if (!this.editModel) return;
    const subs = this.subsForCategory(this.editModel.category_id);
    this.editModel.subcategory_id = subs.length ? subs[0].id : null;
  }

  async loadCategories() { this.categories = await this.sb.getCategories(); }

  // Handle image selection
  async onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      await Swal.fire('Invalid File', 'Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      await Swal.fire('File Too Large', 'Image must be less than 5MB', 'error');
      return;
    }

    this.uploadingImage = true;
    try {
      // Convert image to base64 for preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.productModel.image_url = e.target.result;
        this.uploadingImage = false;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      this.uploadingImage = false;
      await Swal.fire('Error', 'Failed to process image', 'error');
    }
  }

  // Remove selected image
  removeImage() {
    this.productModel.image_url = '';
    // Reset file input
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  // Gallery Images Functions
  onGallerySelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.uploadGalleryImages(files);
    }
  }

  async uploadGalleryImages(files: FileList) {
    this.uploadingGallery = true;
    const uploadPromises = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        await Swal.fire('Invalid File', `File ${file.name} is not an image`, 'error');
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        await Swal.fire('File Too Large', `File ${file.name} must be less than 5MB`, 'error');
        continue;
      }
      
      const uploadPromise = this.uploadSingleGalleryImage(file);
      uploadPromises.push(uploadPromise);
    }
    
    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      // Filter out any null/undefined URLs
      const validUrls = uploadedUrls.filter(url => url && url.trim() !== '');
      this.productModel.gallery_images = [...this.productModel.gallery_images, ...validUrls];
      
      if (validUrls.length > 0) {
        await Swal.fire('Success', `${validUrls.length} image(s) uploaded successfully`, 'success');
        // Reset the file input
        const galleryInput = document.getElementById('galleryUpload') as HTMLInputElement;
        if (galleryInput) galleryInput.value = '';
      } else {
        await Swal.fire('Warning', 'No images were uploaded successfully', 'warning');
      }
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload some images. Please try again.';
      await Swal.fire('Error', errorMessage, 'error');
    } finally {
      this.uploadingGallery = false;
    }
  }


  async uploadSingleGalleryImage(file: File): Promise<string> {
    try {
      console.log('Starting upload for file:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;
      
      console.log('Uploading to path:', filePath);

      // Use the gallery-images bucket directly (already created manually)
      const bucketName = 'gallery-images';
      console.log(`Using bucket: ${bucketName}`);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful, data:', uploadData);

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      console.log('Image uploaded successfully:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading single gallery image:', error);
      throw error;
    }
  }

  removeGalleryImage(index: number) {
    this.productModel.gallery_images.splice(index, 1);
  }

  onGalleryDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.uploadGalleryImages(files);
    }
  }

  onGalleryDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onGalleryDragEnter(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onGalleryDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  async addProduct() {
    if (!this.productModel.category_id) {
      await Swal.fire('Error', 'Please select a category', 'error');
      return;
    }

    const p = { ...this.productModel,
      sizes: this.productModel.sizes ? this.productModel.sizes.split(',').map((s:string)=>s.trim()).filter(Boolean) : []
    };
    try {
      await this.sb.createProduct(p);
      await Swal.fire('Added', 'Product added', 'success');
      this.productModel = { name:'', price:0, priceBeforeOffer:null, image_url:'', gallery_images:[], color:'', quantity:0, details:'', status:'متاح', sizes:'', category_id:null, subcategory_id:null };
      // Reset file inputs
      const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      const galleryInput = document.getElementById('galleryUpload') as HTMLInputElement;
      if (galleryInput) galleryInput.value = '';
      await this.loadProducts();
    } catch (e:any) { await Swal.fire('Error', (e.message||e), 'error'); }
  }

  // helper to return subcategories for a category
  subsForCategory(catId: number | string) {
    if (!catId) return [];
    const filtered = this.subcategories.filter(s => s.category_id == catId);
    console.log(`Subcategories for category ${catId}:`, filtered);
    return filtered;
  }

  async loadProducts() {
    this.loading = true;
    this.products = await this.sb.getProducts();
    this.loading = false;
  }

  // Delete a product
  async deleteProduct(id: number | string) {
    const res = await Swal.fire({ 
      title: 'Delete Product?', 
      text: 'This action cannot be undone. Are you sure you want to delete this product?', 
      icon: 'warning', 
      showCancelButton: true, 
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    });
    
    if (!res.isConfirmed) return;
    
    this.deletingProduct = id;
    try {
      await this.sb.deleteProduct(id);
      await this.loadProducts();
      await Swal.fire({
        title: 'Deleted!',
        text: 'Product has been deleted successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (e:any) { 
      await Swal.fire('Error', (e.message||e), 'error'); 
    } finally {
      this.deletingProduct = null;
    }
  }

  // Begin editing
  editProduct(p: any) {
    this.editId = p.id;
    this.editModel = { ...p, sizes: (p.sizes || []).join(', ') };
    console.log('Editing product:', p.name);
  }

  cancelEdit() { 
    this.editId = null; 
    this.editModel = null; 
    console.log('Edit cancelled');
  }

  // Check if any operation is in progress
  isOperationInProgress(productId: number | string): boolean {
    return this.savingProduct === productId || this.deletingProduct === productId;
  }

  // Handle keyboard shortcuts
  onKeyDown(event: KeyboardEvent, productId: number | string) {
    if (event.key === 'Enter' && this.editId === productId) {
      this.saveEdit(productId);
    } else if (event.key === 'Escape' && this.editId === productId) {
      this.cancelEdit();
    }
  }

  // Logout function
  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }

  // Get current admin
  getCurrentAdmin() {
    return this.authService.getCurrentAdmin();
  }

  // Reset the add product form
  resetForm() {
    this.productModel = { 
      name: '', 
      price: 0, 
      priceBeforeOffer: null,
      image_url: '', 
      gallery_images: [],
      color: '', 
      quantity: 0, 
      details: '', 
      status: 'متاح', 
      sizes: '', 
      category_id: null,
      subcategory_id: null
    };
    // Reset file inputs
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    const galleryInput = document.getElementById('galleryUpload') as HTMLInputElement;
    if (galleryInput) galleryInput.value = '';
  }

  async saveEdit(id: number | string) {
    if (!this.editModel) return;
    
    // Validate required fields
    if (!this.editModel.name?.trim()) {
      await Swal.fire('Validation Error', 'Product name is required', 'warning');
      return;
    }
    if (!this.editModel.price || this.editModel.price <= 0) {
      await Swal.fire('Validation Error', 'Valid price is required', 'warning');
      return;
    }
    if (!this.editModel.category_id) {
      await Swal.fire('Validation Error', 'Category is required', 'warning');
      return;
    }
    
    this.savingProduct = id;
    const updates: any = { ...this.editModel };
    
    // Convert sizes string to array
    updates.sizes = this.editModel.sizes ? String(this.editModel.sizes).split(',').map((s:string)=>s.trim()).filter(Boolean) : [];
    
    // Remove fields that are not actual columns in products table (e.g. joined relations)
    delete updates.id;
    delete updates.categories;
    delete updates.categories_id;
    // remove any other nested objects
    Object.keys(updates).forEach(k => { if (typeof updates[k] === 'object' && !Array.isArray(updates[k])) delete updates[k]; });
    
    try {
      await this.sb.updateProduct(id, updates);
      this.editId = null;
      this.editModel = null;
      await this.loadProducts();
      await Swal.fire({
        title: 'Updated!',
        text: 'Product has been updated successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (e:any) { 
      await Swal.fire('Error', (e.message||e), 'error'); 
    } finally {
      this.savingProduct = null;
    }
  }
}
