import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule,AlertController, PopoverController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';

@Component({
  standalone: true,
  imports: [CommonModule, IonicModule],
  selector: 'app-popover-menu',
  templateUrl: './popover-menu.component.html',
  styleUrls: ['./popover-menu.component.scss']
})
export class PopoverMenuComponent {
  translateMenuOpen = false;
  summarizeMenuOpen = false;

  constructor(private popoverCtrl: PopoverController,  private http: HttpClient,   private loadingCtrl: LoadingController,) {}

  selectAction(action: string) {
    this.popoverCtrl.dismiss(action);
  }

  toggleSubmenu(menu: string) {
    if (menu === 'translate') {
      this.translateMenuOpen = !this.translateMenuOpen;
      this.summarizeMenuOpen = false;
    } else if (menu === 'summarize') {
      this.summarizeMenuOpen = !this.summarizeMenuOpen;
      this.translateMenuOpen = false;
    }
  }
  isFirstTranslation: boolean = true;
  languages = [
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese'

    }
  ];
  loadingMessage: string = 'Loading...';
  selectedLanguage: string = 'fr'; // Langue par défaut
  detectedLanguage: string = 'en';
  errorMessage: string = '';
  isLoading: boolean = true;
  transcribedText: string = '';
  translatedText: string | null = null;
  originalText: string | null = null; // Nouvelle variable pour stocker le texte original
  detectLanguage(text: string) {
    // Exemple de requête pour une API de détection de langue, par exemple Google Translate API ou un service similaire
    this.http.post<any>('https://api.detectlanguage.com/0.2/detect', {
      q: text
    }).subscribe({
      next: (response) => {
        this.detectedLanguage = response.data.detections[0].language; // Récupérer la langue détectée
        console.log('Detected language:', this.detectedLanguage);
      },
      error: (error) => {
        console.error('Error detecting language:', error);
        this.detectedLanguage = 'en'; // Si l'API échoue, utiliser l'anglais par défaut
      }
    });
  }
  async presentLoading1() {
    const loading = await this.loadingCtrl.create({
      message: 'Translating...',  // Message personnalisé
      spinner: 'crescent',  // Type de spinner (tu peux changer si tu veux)
      cssClass: 'full-page-loading',  // Classe CSS pour personnaliser le style du spinner
      backdropDismiss: false,  // Empêche la fermeture quand on clique en dehors
    });

    await loading.present();  // Affiche le loader
    return loading;  // Retourne l'instance du loader pour pouvoir le fermer plus tard
  }
  translateText(text: string, targetLang: string) {
    console.log('👉 Translating text:', text, 'to:', targetLang);
    if (!text || !targetLang) return;
    this.originalText = text; // 🔹 Sauvegarde le texte original

    this.isLoading = true;
    this.loadingMessage = 'Translating...';
      // Show loading spinner
    this.presentLoading1().then((loading) => {
      this.http.post<any>('http://localhost:8001/translate/', {
        text: this.originalText,

        src_lang: this.detectedLanguage, // 🔹 Changer "srcLang" en "src_lang"
        tgt_lang: targetLang
      }).subscribe({
        next: (response) => {
          console.log('✅ Translation received:', response);
          this.transcribedText = response.translation; // Remplace le texte par la traduction
          this.isLoading = false;
          loading.dismiss(); // Ferme le loader après la traduction
        },
        error: (error) => {
          console.error('❌ Error translating:', error);
          this.errorMessage = 'Erreur lors de la traduction.';
          this.isLoading = false;
          loading.dismiss(); // Ferme le loader en cas d'erreur
        }
      });
    });
  }
  translateAndReset(text: string, targetLang: string) {
    if (!this.originalText) {
      this.originalText = this.transcribedText; // Sauvegarder une seule fois le texte transcrit (Whisper)
    }
    if (this.isFirstTranslation) {
      this.isFirstTranslation = false;  // Désactiver l'indicateur après la première traduction
    } else {
      // Réinitialiser le texte traduit et garder le texte transcrit (original)
      this.translatedText = null;  // Effacer la traduction uniquement si ce n'est pas la première fois
    }

    // Toujours revenir au texte transcrit (de Whisper), pas au texte traduit
    this.transcribedText = this.originalText;

    console.log('Text has been reset to transcribed (original):', this.transcribedText);

    // Traduire ensuite avec le texte transcrit
    this.translateText(this.transcribedText, targetLang);
  }
}
