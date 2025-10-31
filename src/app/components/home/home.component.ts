import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { TestimonialsDisplayComponent } from '../testimonials-display/testimonials-display.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TestimonialsDisplayComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  products: any[] = [];
  subcategories: any[] = [];
  productsBySubcategory: { [key: string]: any[] } = {};
  loading = true;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadData();
  }

  ngAfterViewInit() {
    // Initialize scroll functionality for all subcategory sections
    setTimeout(() => {
      this.initializeScrollArrows();
    }, 100);
  }

  async loadData() {
    try {
      this.loading = true;
      
      // Get all products with subcategories
  const allProducts = await this.supabaseService.getProducts();
      
      // Get all subcategories
  const allSubcategories = await this.supabaseService.getSubcategories();
      
      this.subcategories = allSubcategories;

      // Group products by subcategory. If there are no subcategories in DB
      // (your case: All subcategories: Array(0)), fall back to grouping by
      // the product.subcategory_id or a 'General' bucket so the home page
      // still shows products.
      this.productsBySubcategory = {};
      if (!this.subcategories || this.subcategories.length === 0) {
        // No subcategories table rows — group by id or put into 'General'
        allProducts.forEach(product => {
          const key = product.subcategory_id ? `Subcategory ${product.subcategory_id}` : 'General';
          if (!this.productsBySubcategory[key]) this.productsBySubcategory[key] = [];
          this.productsBySubcategory[key].push(product);
        });
      } else {
        // Normal flow: use subcategory names from the table
        allProducts.forEach(product => {
          const subcategoryName = this.getSubcategoryName(product.subcategory_id);
          if (!this.productsBySubcategory[subcategoryName]) {
            this.productsBySubcategory[subcategoryName] = [];
          }
          this.productsBySubcategory[subcategoryName].push(product);
        });
      }

  // products grouped into this.productsBySubcategory
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.loading = false;
    }
  }

  getSubcategoryName(subcategoryId: number): string {
    if (!subcategoryId) return 'Other';
    const subcategory = this.subcategories.find(sub => sub.id === subcategoryId);
    return subcategory ? subcategory.name : 'Other';
  }

  // Scroll methods for each subcategory
  scrollLeft(subcategoryName: string) {
    const scrollContainer = document.getElementById(`scroll-${subcategoryName}`);
    if (scrollContainer) {
      scrollContainer.scrollBy({
        left: -320,
        behavior: 'smooth'
      });
    }
  }

  scrollRight(subcategoryName: string) {
    const scrollContainer = document.getElementById(`scroll-${subcategoryName}`);
    if (scrollContainer) {
      scrollContainer.scrollBy({
        left: 320,
        behavior: 'smooth'
      });
    }
  }

  initializeScrollArrows() {
  // This method can be used to initialize any scroll-related functionality
  }

  getSubcategoryKeys(): string[] {
    return Object.keys(this.productsBySubcategory);
  }
}
