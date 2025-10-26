import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product: any = null;
  loading = true;
  currentImageIndex = 0;
  currentImageUrl = '';
  showImageModal = false;
  
  constructor(private route: ActivatedRoute, private sb: SupabaseService) {}

  async ngOnInit() {
    try {
      this.loading = true;
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (!id) return;
      this.product = await this.sb.getProductById(id);
      
      // Initialize current image
      if (this.product) {
        this.currentImageUrl = this.product.image_url;
        this.currentImageIndex = 0;
      }
      
      // Add keyboard navigation
      document.addEventListener('keydown', this.handleKeydown.bind(this));
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy() {
    // Remove keyboard event listener
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }

  private handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.showImageModal) {
      this.closeImageModal();
      return;
    }
    
    if (!this.product?.gallery_images?.length) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.previousImage();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextImage();
        break;
    }
  }

  openWhatsApp() {
    if (!this.product) return;
    const phone = '201011708963'; 
    // Build a readable message without image URL since WhatsApp doesn't display images from URLs in text
    const parts = [];
    parts.push('طلب منتج');
    parts.push(`اسم: ${this.product.name}`);
    parts.push(`السعر: ${String(this.product.price)} EGP`);
    if (this.product.color) parts.push(`اللون: ${this.product.color}`);
    if (this.product.sizes && this.product.sizes.length) parts.push(`المقاسات: ${(this.product.sizes||[]).join(', ')}`);
    // Removed image URL since it doesn't display properly in WhatsApp messages
    const text = encodeURIComponent(parts.join('\n'));
    const url = `https://wa.me/${phone}?text=${text}`;
    window.open(url, '_blank');
  }

  selectGalleryImage(imageUrl: string, index: number) {
    // Update the current image to show the selected gallery image
    this.currentImageUrl = imageUrl;
    this.currentImageIndex = index;
  }

  selectMainImage() {
    // Show the main product image
    if (this.product) {
      this.currentImageUrl = this.product.image_url;
      this.currentImageIndex = 0;
    }
  }

  previousImage() {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.updateCurrentImage();
    }
  }

  nextImage() {
    const totalImages = this.product?.gallery_images?.length || 0;
    if (this.currentImageIndex < totalImages) {
      this.currentImageIndex++;
      this.updateCurrentImage();
    }
  }

  private updateCurrentImage() {
    if (this.currentImageIndex === 0) {
      // Show main image
      this.currentImageUrl = this.product.image_url;
    } else {
      // Show gallery image
      const galleryIndex = this.currentImageIndex - 1;
      this.currentImageUrl = this.product.gallery_images[galleryIndex];
    }
  }

  openImageModal() {
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
  }
}
