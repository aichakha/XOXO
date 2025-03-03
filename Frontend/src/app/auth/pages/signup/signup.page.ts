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
      next: () => this.router.navigate(['/acceuil']),
      error: err => console.error('Signup error:', err),
    });
    
    
  }
}
