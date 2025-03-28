import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
@Component({
  selector: 'app-signup',
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss']
})
export class SignupPage {
  user = { name: '', email: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  signup() {
    this.authService.signUp(this.user).subscribe({
      next: () => this.router.navigate(['/acceuil-user']),
      error: err => console.error('Signup error:', err),
    });


  }
  backlogin() {
    this.router.navigate(['/login']); // Assurez-vous d'avoir cette route définie
  }
  Home() {
    this.router.navigate(['/acceuil-user']);
  }
}

