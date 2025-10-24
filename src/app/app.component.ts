import { Component } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserNavbarComponent } from './components/user-navbar/user-navbar.component';
import { AdminNavbarComponent } from './components/admin-navbar/admin-navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, UserNavbarComponent, AdminNavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isAdminRoute = false;
  isLoggedIn = false;

  constructor(private router: Router, private authService: AuthService) {
    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isAdminRoute = event.url.startsWith('/admin');
      });

    // Listen to authentication changes
    this.authService.currentAdmin$.subscribe(admin => {
      this.isLoggedIn = admin !== null;
    });
  }

  shouldShowAdminNavbar(): boolean {
    return this.isAdminRoute && this.isLoggedIn;
  }

  shouldShowUserNavbar(): boolean {
    return !this.isAdminRoute || !this.isLoggedIn;
  }
}
