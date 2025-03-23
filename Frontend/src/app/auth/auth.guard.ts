import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService,private router: Router) {}

  canActivate(): boolean {
    const decodedToken = this.authService.getDecodedToken();
    if (this.authService.isLoggedIn()) {
    if (!decodedToken || this.isTokenExpired(decodedToken.exp)) {
      this.router.navigate(['/login']);
      return false;
    }}

    return true;
  }

  private isTokenExpired(exp: number): boolean {
    return Date.now() >= exp * 1000;
  }
}
