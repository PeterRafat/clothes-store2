import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  currentAdmin: any = null;
  stats = {
    totalProducts: 0,
    totalCategories: 0,
    totalSubcategories: 0
  };
  loading = true;

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.currentAdmin = this.authService.getCurrentAdmin();
    
    if (!this.currentAdmin) {
      this.router.navigate(['/admin/login']);
      return;
    }

    await this.loadStats();
  }

  async loadStats() {
    try {
      this.loading = true;
      
      // Load products count
      const products = await this.supabaseService.getProducts();
      this.stats.totalProducts = products.length;
      
      // Load categories count
      const categories = await this.supabaseService.getCategories();
      this.stats.totalCategories = categories.length;
      
      // Load subcategories count
      const subcategories = await this.supabaseService.getSubcategories();
      this.stats.totalSubcategories = subcategories.length;
      
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      this.loading = false;
    }
  }

  navigateToProducts() {
    this.router.navigate(['/admin/products']);
  }

  navigateToCategories() {
    this.router.navigate(['/admin/categories']);
  }

  navigateToAboutUs() {
    this.router.navigate(['/admin/about-us']);
  }

  navigateToPaymentPolicy() {
    this.router.navigate(['/admin/payment-policy']);
  }

  navigateToReturnPolicy() {
    this.router.navigate(['/admin/return-policy']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
