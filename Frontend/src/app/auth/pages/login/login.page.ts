import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone: true, // Ajouté pour éviter les erreurs d'importation dans Angular 15+
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

  rememberMe = false; // ✅ Ajout de rememberMe
  errorMessage = '';
  isLoading = false; // ✅ Ajout de isLoading
  navCtrl: any;

  constructor(private authService: AuthService, private router: Router) {}
  
  goHome() {
    this.navCtrl.navigateRoot('/home'); // Assurez-vous que le chemin est correct
  }
  onLogin() {
    // Simuler une connexion API (remplace par ton appel réel à l'API)
    const mockApiResponse = {
      token: 'fake-jwt-token',
      user: { id: 1, name: 'John Doe', email: this.email }
    };

    // Stocker les informations de connexion
    this.authService.setToken(mockApiResponse.token);
    this.authService.setUser(mockApiResponse.user);

    console.log('User logged in:', mockApiResponse.user);
    console.log('LocalStorage user:', localStorage.getItem('user')); // Vérification

    // Rediriger vers la page d'accueil
    this.router.navigate(['/home']);
  }


  /*login() {
    this.isLoading = true; // ✅ Activation du spinner de chargement

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('✅ Login successful:', response);
        this.authService.setToken(response.token);

        // ✅ Stocker le token si "Remember Me" est activé
        if (this.rememberMe) {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('username', response.username);
        }

        (document.activeElement as HTMLElement)?.blur();
        this.router.navigate(['/acceuil-user']); // 🔹 Redirection vers la page des utilisateurs connectés
      },
      error: (error) => {
        console.error('🚨 Login failed:', error);
        this.errorMessage = 'Login failed: ' + (error.error?.message || 'Unknown error');
      },
      complete: () => {
        this.isLoading = false; // ✅ Désactivation du spinner
      }
    });
  }*/
    login() {
      this.authService.login(this.email, this.password).subscribe({
        next: (response) => {
          console.log('✅ Login successful:', response);
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('name', response.username);
          localStorage.setItem('userId', response.userId);

          this.router.navigate(['/acceuil-user']); // 🔹 Rediriger après connexion
        },
        error: (error) => {
          console.error('🚨 Login failed:', error);
        }
      });
    }



  forgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
  backsignup() {
    this.router.navigate(['/signup']);
  }
  goBack() {
    this.router.navigate(['/acceuil']); // Replace with actual route
  }
  Home() {
    this.router.navigate(['/acceuil']);
  }

}
