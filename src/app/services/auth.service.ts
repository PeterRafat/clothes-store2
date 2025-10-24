import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface AdminUser {
  id: number;
  username: string;
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentAdminSubject = new BehaviorSubject<AdminUser | null>(null);
  public currentAdmin$ = this.currentAdminSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {
    // Check if admin is already logged in (from localStorage)
    this.checkStoredAuth();
  }

  // Check stored authentication
  private checkStoredAuth() {
    const storedAdmin = localStorage.getItem('admin_user');
    if (storedAdmin) {
      try {
        const admin = JSON.parse(storedAdmin);
        this.currentAdminSubject.next(admin);
      } catch (e) {
        localStorage.removeItem('admin_user');
      }
    }
  }

  // Login admin
  async login(username: string, password: string): Promise<{ success: boolean; message: string; admin?: AdminUser }> {
    try {
      console.log('AuthService: Starting login process...');
      
      // First test if we can access the admins table
      const tableTest = await this.supabaseService.testAdminsTable();
      console.log('AuthService: Table test result:', tableTest);
      
      if (!tableTest.success) {
        return {
          success: false,
          message: `Cannot access admins table: ${(tableTest.error as any)?.message || 'Unknown error'}`
        };
      }
      
      const admin = await this.supabaseService.loginAdmin(username, password);
      console.log('AuthService: Login result:', admin);
      
      if (admin) {
        const adminUser: AdminUser = {
          id: admin.id,
          username: admin.name,  // Use 'name' field as username
          name: admin.name
        };
        
        // Store in localStorage
        localStorage.setItem('admin_user', JSON.stringify(adminUser));
        this.currentAdminSubject.next(adminUser);
        
        return {
          success: true,
          message: 'Login successful',
          admin: adminUser
        };
      } else {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }
    } catch (error: any) {
      console.error('AuthService: Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  }

  // Logout admin
  logout(): void {
    localStorage.removeItem('admin_user');
    this.currentAdminSubject.next(null);
  }

  // Check if admin is logged in
  isLoggedIn(): boolean {
    return this.currentAdminSubject.value !== null;
  }

  // Get current admin
  getCurrentAdmin(): AdminUser | null {
    return this.currentAdminSubject.value;
  }

  // Check authentication status
  isAuthenticated(): Observable<boolean> {
    return new Observable(observer => {
      this.currentAdmin$.subscribe(admin => {
        const isAuth = admin !== null;
        console.log('AuthService: isAuthenticated check:', isAuth, admin);
        observer.next(isAuth);
      });
    });
  }
}
