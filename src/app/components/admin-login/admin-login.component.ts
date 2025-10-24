import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {
  loginForm = {
    username: '',
    password: ''
  };
  
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  async onSubmit() {
    if (!this.loginForm.username.trim() || !this.loginForm.password.trim()) {
      await Swal.fire('Error', 'Please enter both admin name and password', 'warning');
      return;
    }

    this.loading = true;
    
    try {
      const result = await this.authService.login(this.loginForm.username, this.loginForm.password);
      
      if (result.success) {
        await Swal.fire({
          title: 'Welcome!',
          text: `Welcome back, ${result.admin?.name || result.admin?.username}!`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        this.router.navigate(['/admin/dashboard']);
      } else {
        await Swal.fire('Login Failed', result.message, 'error');
      }
    } catch (error: any) {
      await Swal.fire('Error', 'An unexpected error occurred', 'error');
    } finally {
      this.loading = false;
    }
  }

  resetForm() {
    this.loginForm = {
      username: '',
      password: ''
    };
  }
}
