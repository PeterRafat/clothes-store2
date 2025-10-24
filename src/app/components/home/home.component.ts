import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
      console.log('All products:', allProducts);
      
      // Get all subcategories
      const allSubcategories = await this.supabaseService.getSubcategories();
      console.log('All subcategories:', allSubcategories);
      
      this.subcategories = allSubcategories;
      
      // Group products by subcategory
      this.productsBySubcategory = {};
      allProducts.forEach(product => {
        if (product.subcategory_id) {
          const subcategoryName = this.getSubcategoryName(product.subcategory_id);
          if (!this.productsBySubcategory[subcategoryName]) {
            this.productsBySubcategory[subcategoryName] = [];
          }
          this.productsBySubcategory[subcategoryName].push(product);
        }
      });
      
      console.log('Products by subcategory:', this.productsBySubcategory);
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
    console.log('Scroll arrows initialized');
  }

  getSubcategoryKeys(): string[] {
    return Object.keys(this.productsBySubcategory);
  }
}
