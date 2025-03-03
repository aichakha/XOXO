import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {
    this.router = router;

  }

  login() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.authService.setToken(response.token);
        (document.activeElement as HTMLElement)?.blur();
        this.router.navigate(['/acceuil']);
      },
      error: (error) => {
        this.errorMessage = 'Login failed: ' + (error.error.message || 'Unknown error');
      },
    });
  }
  forgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}
