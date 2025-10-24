import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    console.log('AuthGuard: Checking authentication for route:', state.url);
    
    return this.authService.isAuthenticated().pipe(
      take(1),
      map(isAuthenticated => {
        console.log('AuthGuard: Is authenticated?', isAuthenticated);
        
        if (isAuthenticated) {
          console.log('AuthGuard: Access granted');
          return true;
        } else {
          console.log('AuthGuard: Access denied, redirecting to login');
          // Redirect to login page
          this.router.navigate(['/admin/login']);
          return false;
        }
      })
    );
  }
}
