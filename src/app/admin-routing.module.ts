import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ProductsComponent } from './components/products/products.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { AdminAboutUsComponent } from './components/admin-about-us/admin-about-us.component';
import { AdminPaymentPolicyComponent } from './components/admin-payment-policy/admin-payment-policy.component';
import { AdminReturnPolicyComponent } from './components/admin-return-policy/admin-return-policy.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        component: AdminLoginComponent
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'products',
        component: ProductsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'categories',
        component: CategoriesComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'about-us',
        component: AdminAboutUsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'payment-policy',
        component: AdminPaymentPolicyComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'return-policy',
        component: AdminReturnPolicyComponent,
        canActivate: [AuthGuard]
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
