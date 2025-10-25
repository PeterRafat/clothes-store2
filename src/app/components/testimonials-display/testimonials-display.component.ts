import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialsService, Testimonial } from '../../services/testimonials.service';

@Component({
  selector: 'app-testimonials-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Testimonials Section -->
    <section class="testimonials-section" *ngIf="!loading && testimonials.length > 0">
      <div class="container">
        <!-- Section Header -->
        <div class="text-center mb-5">
          <h2 class="section-title">
            <i class="fas fa-quote-left me-2 text-primary"></i>
            آراء عملائنا
          </h2>
          <p class="section-subtitle">ما يقوله عملاؤنا عن تجربتهم معنا</p>
        </div>

        <!-- Testimonials Carousel -->
        <div class="testimonials-carousel" 
             (mouseenter)="pauseAutoSlide()" 
             (mouseleave)="resumeAutoSlide()">
          
          <!-- Main Testimonial Display -->
          <div class="testimonial-main">
            <div class="testimonial-card" *ngIf="testimonials[currentIndex]">
              <div class="profile-card p-3">
                <div class="card-top d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center">
                    <div class="avatar-wrap">
                      <img *ngIf="testimonials[currentIndex].profile_image" [src]="testimonials[currentIndex].profile_image" [alt]="testimonials[currentIndex].name" class="avatar-image" />
                      <div *ngIf="!testimonials[currentIndex].profile_image" class="avatar-placeholder"><i class="fas fa-user"></i></div>
                    </div>
                    <div class="user-meta ms-3">
                      <div class="username">{{testimonials[currentIndex].name}}</div>
                      <div class="status-message text-muted">{{testimonials[currentIndex].message}}</div>
                    </div>
                  </div>

                  <div class="header-social">
                    <img *ngIf="testimonials[currentIndex].social_icon" [src]="testimonials[currentIndex].social_icon" alt="social" class="header-social-icon" />
                  </div>
                </div>

                <div class="card-bottom d-flex justify-content-end mt-3">
                  <div class="timestamp text-muted small">{{testimonials[currentIndex].created_at | date:'short'}}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Controls -->
          <div class="carousel-controls" *ngIf="testimonials.length > 1">
            <button class="control-btn prev-btn" (click)="previousTestimonial()">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="control-btn next-btn" (click)="nextTestimonial()">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>

          <!-- Dots Indicator -->
          <div class="carousel-dots" *ngIf="testimonials.length > 1">
            <button 
              *ngFor="let testimonial of testimonials; let i = index"
              class="dot"
              [class.active]="i === currentIndex"
              (click)="goToTestimonial(i)"
            ></button>
          </div>

          <!-- Testimonial Counter -->
          <div class="testimonial-counter" *ngIf="testimonials.length > 1">
            <span>{{currentIndex + 1}} / {{testimonials.length}}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading State -->
    <div *ngIf="loading" class="testimonials-loading">
      <div class="container text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading testimonials...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div *ngIf="!loading && testimonials.length === 0" class="testimonials-empty">
      <div class="container text-center py-5">
        <div class="empty-state">
          <i class="fas fa-comments text-muted" style="font-size: 4rem;"></i>
          <h4 class="mt-3 text-muted">No Testimonials Available</h4>
          <p class="text-muted">Check back later for customer reviews.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Testimonials Display Styles */
    .testimonials-section {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 3rem 0;
      position: relative;
      overflow: hidden;
    }

    .section-title {
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 1rem;
      position: relative;
    }

    .section-title::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 4px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 2px;
    }

    .section-subtitle {
      font-size: 1.1rem;
      color: #6c757d;
      margin-bottom: 0;
    }

    .testimonials-carousel {
      position: relative;
      max-width: 450px; /* reduced width for slimmer cards */
      margin: 0 auto;
    }

    .testimonial-main {
      position: relative;
      margin-bottom: 2rem;
    }

    .testimonial-card {
      background: white;
      border-radius: 20px;
      padding: 1.25 rem;
      box-shadow: 0 8px 24px rgba(30, 90, 170, 0.08);
      position: relative;
      overflow: hidden;
      transition: all 0.5s ease;
    }

    .testimonial-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    /* New profile-card style for user-facing testimonial */
    .profile-card {
      background: #ffffff;
      border-radius: 16px;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      color: #234156;
      max-width: 600px; /* constrain card width so it's slightly narrower */
      margin: 0 auto;
    }

    .card-top {
      align-items: center;
    }

    .avatar-wrap { flex-shrink: 0; }

    .avatar-image {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(102,126,234,0.15);
      box-shadow: 0 4px 12px rgba(102,126,234,0.08);
    }

    .avatar-placeholder {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display:flex;align-items:center;justify-content:center;
      background: linear-gradient(135deg,#eaf2ff 0%,#dceeff 100%);
      color:#2c6cdf;
      font-size:1.25rem;
      border:2px solid rgba(102,126,234,0.12);
    }

    .user-meta .username {
      font-weight:700;
      color:#0f2b45;
      font-size:1rem;
      padding-right:10px;
    }

    .status-message {
      font-size:0.95rem;
      color:#557085;
      margin-top:10px; /* increased so message sits lower */
      max-width:420px;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }

    .header-social .header-social-icon {
      width:28px;height:28px;border-radius:6px;object-fit:cover;border:1px solid rgba(0,0,0,0.04);
    }

    .card-bottom { margin-top:8px; }

    .timestamp { color:#6c7d89; }

    .customer-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
    }

    .customer-avatar {
      position: relative;
    }

    .avatar-image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #667eea;
      transition: all 0.3s ease;
    }

    .avatar-placeholder {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2rem;
      border: 4px solid #667eea;
    }

    .customer-details {
      text-align: left;
    }

    .customer-name {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .rating {
      margin-bottom: 0.5rem;
    }

    .star {
      color: #ffc107;
      font-size: 1.1rem;
      margin-right: 2px;
    }

    .social-link {
      display: inline-block;
    }

    .social-icon {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      transition: transform 0.3s ease;
    }

.carousel-controls {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  z-index: 10;
  pointer-events: none; /* let buttons handle clicks only */
}

.control-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto;
  font-size: 1.2rem;
  color: #667eea;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.control-btn:hover {
  background: #ffffff;
  transform: scale(1.1);
}


    .carousel-dots {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 2rem;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: none;
      background: #dee2e6;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .dot.active {
      background: #667eea;
      transform: scale(1.2);
    }

    .testimonial-counter {
      position: absolute;
      bottom: -30px;
      right: 0;
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      padding: 0.3rem 0.8rem;
      border-radius: 15px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .testimonials-loading, .testimonials-empty {
      background: #f8f9fa;
      padding: 4rem 0;
    }

    .spinner-border {
      width: 3rem;
      height: 3rem;
      color: #667eea;
    }

    .empty-state {
      padding: 2rem;
    }

    .empty-state i {
      opacity: 0.5;
    }

    @media (max-width: 768px) {
      .testimonials-section {
        padding: 3rem 0;
      }
      
      .section-title {
        font-size: 2rem;
      }
      
      .testimonial-card {
        padding: 2rem 1.5rem;
        margin: 0 1rem;
      }
      
      .testimonial-message {
        font-size: 1.1rem;
        line-height: 1.6;
      }
      
      .customer-info {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }
      
      .customer-details {
        text-align: center;
      }
      
      .avatar-image, .avatar-placeholder {
        width: 60px;
        height: 60px;
      }
      
      .carousel-controls {
        padding: 0 1rem;
      }
      
      .control-btn {
        width: 40px;
        height: 40px;
        font-size: 1rem;
      }
      
      .testimonial-counter {
        position: static;
        margin-top: 1rem;
        display: inline-block;
      }
    }
  `]
})
export class TestimonialsDisplayComponent implements OnInit {
  testimonials: Testimonial[] = [];
  loading = true;
  currentIndex = 0;
  autoSlideInterval: any;

  constructor(private testimonialsService: TestimonialsService) {}

  async ngOnInit() {
    await this.loadTestimonials();
    this.startAutoSlide();
  }

  ngOnDestroy() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  async loadTestimonials() {
    try {
      this.loading = true;
      this.testimonials = await this.testimonialsService.getTestimonials();
    } catch (error) {
      console.error('Error loading testimonials:', error);
    } finally {
      this.loading = false;
    }
  }

  startAutoSlide() {
    if (this.testimonials.length > 1) {
      this.autoSlideInterval = setInterval(() => {
        this.nextTestimonial();
      }, 5000); // Change every 5 seconds
    }
  }

  nextTestimonial() {
    if (this.testimonials.length > 1) {
      this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
    }
  }

  previousTestimonial() {
    if (this.testimonials.length > 1) {
      this.currentIndex = this.currentIndex === 0 ? this.testimonials.length - 1 : this.currentIndex - 1;
    }
  }

  goToTestimonial(index: number) {
    this.currentIndex = index;
    // Reset auto slide timer
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.startAutoSlide();
    }
  }

  // rating removed — no star helper

  // Pause auto slide on hover
  pauseAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  // Resume auto slide when mouse leaves
  resumeAutoSlide() {
    this.startAutoSlide();
  }
}
