//devenue How it works page
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ContactPage implements OnInit {



  uploadedFileName: string = '';
  uploadedFile: File | null = null;
  mediaUrl: string = '';
  isAuthenticated = false;
  username: string | null = null;

  constructor( private router: Router, private authService: AuthService) {} // Injection correcte de Router


  Home() {
    // Réinitialiser les fichiers uploadés et les champs
    this.uploadedFile = null;
    this.uploadedFileName = '';
    this.mediaUrl = '';

    // Réinitialiser l'input file (pour éviter qu'il garde l'ancien fichier)
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Réinitialisation de l'élément HTML input file
    }

    this.router.navigate(['/acceuil']);
  }
  ngOnInit() {
    this.isAuthenticated = this.authService.isLoggedIn();
    console.log('🔐 Authenticated:', this.isAuthenticated);
    this.authService.username$.subscribe(digits => this.username = digits);
    this.username = localStorage.getItem('username');
    const user = localStorage.getItem('user');
  }
  Homeuser() {
    this.uploadedFile = null;
    this.uploadedFileName = '';
    this.mediaUrl = '';

    // Réinitialiser l'input file (pour éviter qu'il garde l'ancien fichier)
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Réinitialisation de l'élément HTML input file
    }
    this.router.navigate(['/acceuil-user']);
  }


  Contact() {
    this.router.navigate(['/contact']); // Navigation fonctionnelle
  }
  History() {
    this.router.navigate(['/history']);
  }
  Historyuser() {
    this.router.navigate(['/history-user']);
  }
  login() {
    this.router.navigate(['/login']);
  }
  signup() {
    // Déconnexion de l'utilisateur (peut être améliorée avec JWT plus tard)

    this.router.navigate(['signup']);
  }
  logout() {
    this.authService.logout();
    this.isAuthenticated = false;
    this.username = null;
    this.router.navigate(['/']); // Redirection après déconnexion
  }

}
