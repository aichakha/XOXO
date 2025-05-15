import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule,AlertController, PopoverController ,ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from 'src/app/auth/auth.guard';
import { AuthService } from 'src/app/auth/services/auth.service';
import { SavedTextService } from 'src/app/auth/services/saved-text.service';


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


  constructor(private popoverCtrl: PopoverController,  private alertCtrl: AlertController,   private toastController: ToastController,
    private toastCtrl: ToastController,  private http: HttpClient,   private loadingCtrl: LoadingController,  private loadingController: LoadingController,
    private authService: AuthService,
    private savedTextService: SavedTextService,
    private router: Router) {}
    @Input() transcribedText: string = '';
    originalText: string | null = null; // 👈 pour stockage propre

    ngOnInit() {
      if (!this.transcribedText || this.transcribedText.trim().length === 0) {
        console.warn('❌ Aucun texte transcrit reçu dans le popover.');
        this.transcribedText = 'Aucun texte transcrit disponible.';
      } else {
        console.log('✅ Texte transcrit reçu dans le popover :', this.transcribedText);
        this.originalText = this.transcribedText; // 👈 on le garde ici pour ne pas perdre la trace
      }
    }


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

  translatedText: string | null = null;

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
      this.http.post<any>('https://4d3e-154-111-224-232.ngrok-free.app/translate/', {
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
  //show toast fonction pour feedback:
  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: 'primary',
      position: 'top'
    });
    toast.present();
  }
  sendEmail(to: string, subject: string) {
    const finalText = this.originalText || this.transcribedText;

    console.log('📩 Texte à envoyer par mail :', finalText);

    if (!finalText || finalText.trim().length === 0 || finalText === 'Aucun texte transcrit disponible.') {
      this.showToast('❌ Aucun texte disponible à envoyer.');
      return;
    }

    const payload = {
      to,
      subject,
      text: finalText
    };

    this.http.post('https://1a29-154-111-224-232.ngrok-free.app/mail/send', payload).subscribe({
      next: () => {
        this.showToast('📤 Mail envoyé avec succès !');
      },
      error: (error) => {
        console.error('❌ Erreur lors de l’envoi du mail :', error);
        this.showToast('Erreur lors de l’envoi du mail.');
      },
    });
  }
//save to history:
async saveCurrentText() {
  const content = this.translatedText || this.transcribedText;

  // Vérifiez que le content n'est pas vide
  if (!content) {
    const toast = await this.toastController.create({
      message: 'No text to save!',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
    return;
  }

  const userId = this.authService.getUserId();
  if (!userId) {
    const toast = await this.toastController.create({
      message: 'Please login to save texts',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
    return;
  }

  const loading = await this.loadingController.create({
    message: 'Saving...'
  });
  await loading.present();

  try {
    // Envoyez explicitement userId et content comme objet
    await firstValueFrom(this.savedTextService.saveText({
      userId: userId,
      content: content
    }));

    const toast = await this.toastController.create({
      message: 'Text saved successfully!',
      duration: 2000,
      color: 'success'
    });
    await toast.present();


    this.router.navigate(['/history']);

  } catch (error: unknown) {
    console.error('Save error:', error);
    let errorMessage = 'Failed to save text';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    const toast = await this.toastController.create({
      message: errorMessage,
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    await loading.dismiss();
  }
}




  async openEmailModal() {
    const alert = await this.alertCtrl.create({
      header: 'Partager par mail',
      inputs: [
        {
          name: 'to',
          type: 'email',
          placeholder: 'Adresse e-mail du destinataire'
        },
        {
          name: 'subject',
          type: 'text',
          placeholder: 'Titre du message'
        },


      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Send',
          handler: data => {
            this.sendEmail(data.to, data.subject); // ici
          }
        }
      ]
    });

    await alert.present();
  }




  showShareOptions = false;

toggleShareOptions() {
  this.showShareOptions = !this.showShareOptions;
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
