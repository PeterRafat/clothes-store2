import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-winter-clothes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './winter-clothes.component.html',
  styleUrls: ['./winter-clothes.component.css']
})
export class WinterClothesComponent implements OnInit, AfterViewInit {
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
      
      // Get all categories to find Winter category
      const categories = await this.supabaseService.getCategories();
      console.log('All categories:', categories);
      console.log('Category names:', categories.map(c => c.name));
      console.log('Category IDs:', categories.map(c => ({ id: c.id, name: c.name })));
      
      // First, try to find by ID 2 (as mentioned by user)
      let winterCategory = categories.find(cat => cat.id === 2);
      console.log('Category with ID 2:', winterCategory);
      
      // If not found by ID, try to find by name variations
      if (!winterCategory) {
        winterCategory = categories.find(cat => {
          const name = cat.name.toLowerCase().trim();
          console.log('Checking category:', name, 'ID:', cat.id);
          return (
            name === 'winter' ||
            name === 'شتاء' ||
            name === 'winter clothes' ||
            name === 'winter wear' ||
            name === 'ملابس شتوية' ||
            name === 'winter collection' ||
            name.includes('winter') ||
            name.includes('شتاء') ||
            name.includes('winter clothes') ||
            name.includes('ملابس شتوية')
          );
        });
      }
      
      console.log('Looking for Winter category in:', categories.map(c => c.name));
      
      if (winterCategory) {
        console.log('Found Winter category:', winterCategory);
        console.log('All products before filtering:', allProducts);
        console.log('Products with category_id 2:', allProducts.filter(p => p.category_id === 2));
        
        // Filter products that belong to Winter category ONLY
        this.products = allProducts.filter(product => 
          product.category_id === winterCategory.id
        );
        
        console.log('Filtered winter products:', this.products);
        
        // Get subcategories for Winter category ONLY
        this.subcategories = await this.supabaseService.getSubcategoriesByCategory(winterCategory.id);
        console.log('Winter subcategories:', this.subcategories);
        console.log('Winter products count:', this.products.length);
        
        // If no products found but subcategories exist, show a message
        if (this.products.length === 0 && this.subcategories.length > 0) {
          console.log('No products found for winter category, but subcategories exist');
        }
      } else {
        console.log('Winter category not found');
        console.log('Available categories:', categories.map(c => c.name));
        
        // If no winter category found, try to find any category that might be winter-related
        const possibleWinterCategory = categories.find(cat => {
          const name = cat.name.toLowerCase().trim();
          return name.includes('clothes') || name.includes('ملابس') || name.includes('winter') || name.includes('شتاء');
        });
        
        if (possibleWinterCategory) {
          console.log('Found possible winter-related category:', possibleWinterCategory);
          this.products = allProducts.filter(product => 
            product.category_id === possibleWinterCategory.id
          );
          this.subcategories = await this.supabaseService.getSubcategoriesByCategory(possibleWinterCategory.id);
        } else {
          // If no winter category found, show NO products instead of all products
          this.products = [];
          this.subcategories = [];
          console.log('No winter category found - showing empty state');
        }
      }
      
      this.filteredProducts = [...this.products];
    } catch (error) {
      console.error('Error loading data:', error);
      this.products = [];
      this.subcategories = [];
      this.filteredProducts = [];
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
