import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage {
  email = '';

  constructor(private authService: AuthService,private router: Router) {this.router = router;}

  requestReset() {
    if (!this.email) {
      alert('Veuillez entrer votre adresse e-mail.');
      return;
    }

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        alert('Vérifiez votre e-mail pour le lien de réinitialisation.');
        this.router.navigate(['/reset-password']);
      },
      error: (err) => console.error('Erreur de réinitialisation du mot de passe :', err)
    });
    
  }
  backlogin() {
    this.router.navigate(['/login']); // Assurez-vous d'avoir cette route définie
  }
}


