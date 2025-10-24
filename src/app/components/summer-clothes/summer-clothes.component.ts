import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-summer-clothes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './summer-clothes.component.html',
  styleUrls: ['./summer-clothes.component.css']
})
export class SummerClothesComponent implements OnInit, AfterViewInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  
  products: any[] = [];
  subcategories: any[] = [];
  filteredProducts: any[] = [];
  selectedSubcategory: string = 'all';
  loading = true;
  canScrollLeft = false;
  canScrollRight = false;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadData();
  }

  ngAfterViewInit() {
    // Wait for the view to be fully initialized
    setTimeout(() => {
      this.updateScrollButtons();
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.addEventListener('scroll', () => {
          this.updateScrollButtons();
        });
      }
    }, 100);
  }

  async loadData() {
    try {
      this.loading = true;
      
      // Get all products with categories
      const allProducts = await this.supabaseService.getProducts();
      console.log('All products:', allProducts);
      
      // Get all categories to find Summer category
      const categories = await this.supabaseService.getCategories();
      console.log('All categories:', categories);
      
      // Find Summer category
      const summerCategory = categories.find(cat => 
        cat.name.toLowerCase().includes('summer') || 
        cat.name.toLowerCase().includes('صيف')
      );
      
      if (summerCategory) {
        console.log('Found Summer category:', summerCategory);
        // Filter products that belong to Summer category
        this.products = allProducts.filter(product => 
          product.category_id === summerCategory.id
        );
        
        // Get subcategories for Summer category
        this.subcategories = await this.supabaseService.getSubcategoriesByCategory(summerCategory.id);
        console.log('Summer subcategories:', this.subcategories);
      } else {
        console.log('Summer category not found, showing all products');
        this.products = allProducts;
        this.subcategories = [];
      }
      
      this.filteredProducts = [...this.products];
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.loading = false;
    }
  }

  onSubcategoryChange() {
    if (this.selectedSubcategory === 'all') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product => 
        product.subcategory_id === parseInt(this.selectedSubcategory)
      );
    }
    // Update scroll buttons after filtering
    setTimeout(() => {
      this.updateScrollButtons();
    }, 100);
  }

  // Helper method to convert to string for template
  toString(value: any): string {
    return String(value);
  }

  // Helper method to get subcategory name
  getSubcategoryName(subcategoryId: number): string {
    if (!subcategoryId) return 'Category';
    const subcategory = this.subcategories.find(sub => sub.id === subcategoryId);
    return subcategory ? subcategory.name : 'Category';
  }

  // Scroll methods
  scrollLeft() {
    console.log('Scroll left clicked');
    if (this.scrollContainer && this.scrollContainer.nativeElement) {
      console.log('Scrolling left...');
      const element = this.scrollContainer.nativeElement;
      element.scrollBy({
        left: -320,
        behavior: 'smooth'
      });
      // Update button states after scrolling
      setTimeout(() => {
        this.updateScrollButtons();
      }, 300);
    } else {
      console.log('Scroll container not found');
    }
  }

  scrollRight() {
    console.log('Scroll right clicked');
    if (this.scrollContainer && this.scrollContainer.nativeElement) {
      console.log('Scrolling right...');
      const element = this.scrollContainer.nativeElement;
      element.scrollBy({
        left: 320,
        behavior: 'smooth'
      });
      // Update button states after scrolling
      setTimeout(() => {
        this.updateScrollButtons();
      }, 300);
    } else {
      console.log('Scroll container not found');
    }
  }

  updateScrollButtons() {
    if (this.scrollContainer) {
      const element = this.scrollContainer.nativeElement;
      this.canScrollLeft = element.scrollLeft > 0;
      this.canScrollRight = element.scrollLeft < (element.scrollWidth - element.clientWidth);
    }
  }
}
