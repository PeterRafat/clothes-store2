import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
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

  // Auto-slide timer (2 seconds)
  private autoSlideTimer: any = null;

  // Thumbnail drag scrolling
  @ViewChild('galleryScroll', { static: false }) galleryScroll!: ElementRef<HTMLDivElement>;
  private isPointerDown = false;
  private startX = 0;
  private startScrollLeft = 0;
  private removePointerDown?: () => void;
  private removePointerMove?: () => void;
  private removePointerUp?: () => void;
  private lastPointerId?: number;
  
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
        // do NOT start auto slide immediately; wait for main image to load to avoid extra work
        // start will be triggered from onMainImageLoad()
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
    // stop auto slide
    this.stopAutoSlide();
    // remove pointer listeners
    if (this.removePointerDown) this.removePointerDown();
    if (this.removePointerMove) this.removePointerMove();
    if (this.removePointerUp) this.removePointerUp();
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
    const phone = '201091433891'; 
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
    const totalImages = (this.product?.gallery_images?.length || 0) + 1; // include main image
    this.currentImageIndex = (this.currentImageIndex + 1) % totalImages;
    this.updateCurrentImage();
  }

  private updateCurrentImage() {
    if (!this.product) return;
    if (this.currentImageIndex === 0) {
      // Show main image
      this.currentImageUrl = this.product.image_url;
    } else {
      // Show gallery image
      const galleryIndex = this.currentImageIndex - 1;
      this.currentImageUrl = this.product.gallery_images[galleryIndex];
    }
    // reset auto slide to keep it in sync after manual changes
    this.restartAutoSlide();
  }

  // Auto-slide controls
  private startAutoSlide() {
    this.stopAutoSlide();
    // advance every 2 seconds
    this.autoSlideTimer = setInterval(() => {
      if (!this.product) return;
      const total = (this.product.gallery_images?.length || 0) + 1;
      this.currentImageIndex = (this.currentImageIndex + 1) % total;
      this.updateCurrentImage();
    }, 4000);
  }
  

  private stopAutoSlide() {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
      this.autoSlideTimer = null;
    }
  }

  private restartAutoSlide() {
    this.startAutoSlide();
  }

  // Thumbnails drag handling (init called from template via ngAfterViewInit)
  ngAfterViewInit() {
    if (!this.galleryScroll) return;
  const el = this.galleryScroll.nativeElement;
  // attach pointer listeners and store removers
  const down = this.onPointerDown.bind(this);
  const move = this.onPointerMove.bind(this);
  const up = this.onPointerUp.bind(this);
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointerleave', up);
  this.removePointerDown = () => { el.removeEventListener('pointerdown', down); };
  this.removePointerMove = () => { el.removeEventListener('pointermove', move); };
  this.removePointerUp = () => { el.removeEventListener('pointerup', up); el.removeEventListener('pointerleave', up); };
  }

  private onPointerDown(e: PointerEvent) {
    this.isPointerDown = true;
    const el = this.galleryScroll.nativeElement;
    const rect = el.getBoundingClientRect();
    this.startX = e.clientX - rect.left;
    this.startScrollLeft = this.galleryScroll.nativeElement.scrollLeft;
    // stop auto slide while interacting
    this.stopAutoSlide();
    try { this.galleryScroll.nativeElement.setPointerCapture?.(e.pointerId); this.lastPointerId = e.pointerId; } catch {}
  }

  private onPointerMove(e: PointerEvent) {
    if (!this.isPointerDown) return;
    e.preventDefault();
    const el = this.galleryScroll.nativeElement;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const walk = (x - this.startX) * 1; // scroll-fast factor
    el.scrollLeft = this.startScrollLeft - walk;
  }

  private onPointerUp() {
    this.isPointerDown = false;
    // resume auto slide
    try { if (this.lastPointerId != null) { this.galleryScroll.nativeElement.releasePointerCapture?.(this.lastPointerId); } } catch {}
    this.lastPointerId = undefined;
    this.startAutoSlide();
  }

  // Called when main image finishes loading; start auto-slide once
  onMainImageLoad() {
    // start auto-slide only if not already running
    if (!this.autoSlideTimer) {
      this.startAutoSlide();
    }
  }

  openImageModal() {
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
  }
}
