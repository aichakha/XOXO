import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { Router,ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';


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
  summarizedText: string = '';
  errorMessage: string = '';
  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) {}

  showSummary: boolean = false; // ✅ Zone de texte cachée par défaut
    ngOnInit() {
    this.route.queryParams.subscribe({
      next: (params) => {
        this.transcribedText = params['text'] || 'Aucun texte transcrit';
        // ✅ Si le texte transcrit est présent, générer un résumé
        if (this.transcribedText) {
          this.summarizeText(this.transcribedText);
        } else {
          this.isLoading = false;
        }
        this.isLoading = false;

      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors de la récupération du texte.';
        this.isLoading = false;
      }
    });
  }
    // ✅ Fonction pour envoyer le texte au backend et obtenir un résumé
    summarizeText(text: string) {
      console.log('👉 Summarizing text:', text); // ✅ Vérifie que la fonction est appelée
      this.showSummary = false; // ✅ Cache la zone avant de résumer
      
      this.http.post<any>('http://localhost:8001/summarize/', { text }).subscribe({
        next: (response: any) => {
          console.log('✅ Summary received:', response); // ✅ Vérifie la réponse
          this.summarizedText = response.summary;
          this.isLoading = false;

          this.showSummary = true; // ✅ Affiche la zone de texte après le résumé
        },
        error: (error) => {
          console.error('❌ Error generating summary:', error); // ✅ Affiche l'erreur dans la console
          this.errorMessage = 'Erreur lors de la génération du résumé.';
          this.isLoading = false;
        }
      });
    }

    //Pour le résumé

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
