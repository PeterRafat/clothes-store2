import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent {
  currentAdmin: any = null;

  constructor(private authService: AuthService) {
    this.authService.currentAdmin$.subscribe(admin => {
      this.currentAdmin = admin;
    });
  }

  logout() {
    this.authService.logout();
  }
}
