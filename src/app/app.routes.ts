import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProductsComponent } from './components/products/products.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminAboutUsComponent } from './components/admin-about-us/admin-about-us.component';
import { AdminPaymentPolicyComponent } from './components/admin-payment-policy/admin-payment-policy.component';
import { AdminReturnPolicyComponent } from './components/admin-return-policy/admin-return-policy.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { PaymentPolicyComponent } from './components/payment-policy/payment-policy.component';
import { ReturnPolicyComponent } from './components/return-policy/return-policy.component';
import { SummerClothesComponent } from './components/summer-clothes/summer-clothes.component';
import { WinterClothesComponent } from './components/winter-clothes/winter-clothes.component';
import { AuthGuard } from './guards/auth.guard';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { TestimonialsDisplayComponent } from './components/testimonials-display/testimonials-display.component';

export const routes: Routes = [
  // User routes
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'product/:id', component: ProductDetailsComponent },
  { path: 'summer-clothes', component: SummerClothesComponent },
  { path: 'winter-clothes', component: WinterClothesComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'payment-policy', component: PaymentPolicyComponent },
  { path: 'return-policy', component: ReturnPolicyComponent },
  
  // Admin routes
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin/products', component: ProductsComponent, canActivate: [AuthGuard] },
  { path: 'admin/categories', component: CategoriesComponent, canActivate: [AuthGuard] },
  { path: 'admin/about-us', component: AdminAboutUsComponent, canActivate: [AuthGuard] },
  { path: 'admin/payment-policy', component: AdminPaymentPolicyComponent, canActivate: [AuthGuard] },
  { path: 'admin/return-policy', component: AdminReturnPolicyComponent, canActivate: [AuthGuard] },
  { path: 'admin/testimonials', component: TestimonialsComponent, canActivate: [AuthGuard] },
  { path: 'admin', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  
  // User testimonials route
  { path: 'testimonials', component: TestimonialsDisplayComponent },
  
  // Redirect unknown routes to home
  { path: '**', redirectTo: '' }
];
