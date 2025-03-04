import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../auth/services/auth.service';
@Component({
  selector: 'app-acceuil',
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  templateUrl: './acceuil.page.html',
  styleUrls: ['./acceuil.page.scss'],
})
export class AcceuilPage {
  login() {
    this.router.navigate(['/login']);
  }
  userName: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  logout() {
    // Déconnexion de l'utilisateur (peut être améliorée avec JWT plus tard)
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
  signup() {
    // Déconnexion de l'utilisateur (peut être améliorée avec JWT plus tard)

    this.router.navigate(['signup']);
  }

  ngOnInit() {
    const user = localStorage.getItem('user');
    if (user) {
      this.userName = JSON.parse(user).name;
    }
  }
  Home() {
    this.router.navigate(['/acceuil']);
  }
}
