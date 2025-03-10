import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { Router,ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit {
  transcribedText: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';
  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe({
      next: (params) => {
        this.transcribedText = params['text'] || 'Aucun texte transcrit';
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la récupération du texte.';
        this.isLoading = false;
      }
    });
  }

  Contact() {
    this.router.navigate(['/contact']);
  }

  Home() {
    this.router.navigate(['/acceuil']);
  }

  History() {
    this.router.navigate(['/history']);
  }

  logout() {
    // Déconnexion de l'utilisateur (peut être améliorée avec JWT plus tard)
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  dropdownOpen = false;

  toggleDropdown(event: Event) {
    event.stopPropagation(); // Empêche la fermeture immédiate
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const clickedInside = (event.target as HTMLElement).closest('.dropdown');
    if (!clickedInside) {
      this.dropdownOpen = false;
    }
  }
}
