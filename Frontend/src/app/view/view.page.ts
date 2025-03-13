import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { Router,ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoadingController } from '@ionic/angular'; 

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
  
  loadingMessage: string = 'Converting...'; 
  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient,  private loadingCtrl: LoadingController,private loadingController: LoadingController) {}

  showSummary: boolean = false; // ✅ Zone de texte cachée par défaut
  ngOnInit() {
    this.route.queryParams.subscribe({
      next: (params) => {
        this.transcribedText = params['text'] || 'Aucun texte transcrit';
        // Ne pas appeler summarizeText ici pour que le résumé soit généré uniquement sur demande
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
      console.log('👉 Summarizing text:', text); // Vérifie que la fonction est appelée
      
      this.isLoading = true; // Indique que le processus est en cours
      this.loadingMessage = 'Converting...'; // Message de chargement
    
      // Afficher le loader
      this.presentLoading().then((loading) => {
        // Appel HTTP pour obtenir le résumé
        this.http.post<any>('http://localhost:8001/summarize/', { text }).subscribe({
          next: (response: any) => {
            console.log('✅ Summary received:', response); // Vérifie la réponse
            this.transcribedText = response.summary;  // Remplacer le texte brut par le résumé
            this.isLoading = false;
    
            // Fermer le loader après avoir reçu le résumé
            loading.dismiss();
          },
          error: (error) => {
            console.error('❌ Error generating summary:', error); // Affiche l'erreur dans la console
            this.errorMessage = 'Erreur lors de la génération du résumé.';
            this.isLoading = false;
    
            // Fermer le loader en cas d'erreur
            loading.dismiss();
          }
        });
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

  // Show full-page loading spinner
  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Summarizing...',  // Message personnalisé
      spinner: 'crescent',  // Type de spinner (tu peux changer si tu veux)
      cssClass: 'full-page-loading',  // Classe CSS pour personnaliser le style du spinner
      backdropDismiss: false,  // Empêche la fermeture quand on clique en dehors
    });
  
    await loading.present();  // Affiche le loader
    return loading;  // Retourne l'instance du loader pour pouvoir le fermer plus tard
  }
  


}
