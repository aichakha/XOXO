import { Component, HostListener, OnInit,ElementRef,ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AlertController, IonicModule } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { Router,ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../auth/services/auth.service';
import jsPDF from 'jspdf';
import { firstValueFrom } from 'rxjs';
import { SavedTextService } from '../auth/services/saved-text.service';
import { PopoverMenuComponent } from '../components/popover-menu.component/popover-menu.component';
import { text } from 'ionicons/icons';
import { Navbar } from "../navbar/navbar";
@Component({

  selector: 'app-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Navbar
],
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit {
  transcribedText: string = 'This is a sample transcribed text.';
  downloadMenuOpen = true;
  isEditing: boolean = false;
  isDropdownOpen = false;
  translatedText: string | null = null;
  isLoading: boolean = true;
  summarizedText: string = '';
  errorMessage: string = '';
  translateMenuOpen = false;
  translateMenuPosition = { x: 0, y: 0 };

  selectedLanguage: string = 'fr'; // Langue cible par défaut
  detectedLanguage: string = 'en';
  uploadedFileName: string | null = null;
  mediaUrl: string="";
  uploadedFile: string | null = "";
  summarizeMenuOpen = false;
  dropdownOpen = false;
  showLogout = false; // Contrôle direct de la visibilité
  loadingMessage: string = 'Converting...';
  showDropdown = false;
  languages = [
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese'

    }
  ];

showCopyButton: any;
isAuthenticated = false;
username: string | null = null;
showEmailModal: boolean = false;
  toastCtrl: any;



  constructor(private router: Router,
     private route: ActivatedRoute,
   private http: HttpClient,
   private savedTextService: SavedTextService,
   private loadingCtrl: LoadingController,
    private loadingController: LoadingController,
    private toastController: ToastController, // Injecting ToastController
    private authService: AuthService, // Injecting AuthService
    private alertController:AlertController,
    private popoverCtrl: PopoverController  ) {}

  showSummary: boolean = false; // ✅ Zone de texte cachée par défaut
  ngOnInit() {
    this.isAuthenticated = this.authService.isLoggedIn();
    console.log('🔐 Authenticated:', this.isAuthenticated);
    this.authService.username$.subscribe(digits => this.username = digits);
    this.username = localStorage.getItem('username');
    console.log('🔑 Username:', this.username);
    this.route.queryParams.subscribe({
      next: (params) => {
        this.transcribedText = params['text'] || 'No transcribed text available';
        // Ne pas appeler summarizeText ici pour que le résumé soit généré uniquement sur demande
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Error fetching the text';
        this.isLoading = false;
      }
    });
  }


  Home() {
    this.uploadedFile = null;
    this.uploadedFileName = '';
    this.mediaUrl = '';

    // Réinitialiser l'input file (pour éviter qu'il garde l'ancien fichier)
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Réinitialisation de l'élément HTML input file
    }

    // Réinitialiser l'input URL
    const urlInput = document.getElementById('urlInput') as HTMLInputElement;
    if (urlInput) {
      urlInput.value = ''; // Réinitialisation de l'élément HTML input URL
    }

    this.router.navigate(['/acceuil-user']);
  }

  async presentPopover(ev: Event) {
    const popover = await this.popoverCtrl.create({
      component: PopoverMenuComponent,
      event: ev,
      translucent: true,
      showBackdrop: true,
      componentProps: {
        transcribedText: this.transcribedText // 👈 Envoie le texte vers le composant
      }
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();

    if (data) {
      let loading = null;

      // Affiche le spinner uniquement pour certaines actions
      const actionsWithLoading = [
        'translate-en', 'translate-fr', 'translate-es',
        'translate-de', 'translate-it', 'translate-pt',
        'summarize-large', 'summarize-medium', 'summarize-small'
      ];

      if (actionsWithLoading.includes(data)) {
        this.loadingMessage = this.getLoadingMessage(data); // 💬 optionnel : message dynamique
        loading = await this.loadingCtrl.create({
          message: this.loadingMessage,
          spinner: 'crescent',
          backdropDismiss: false
        });
        await loading.present();
      }

      // Traitement des actions
      switch (data) {
        case 'translate-en':
          await this.translateAndReset(this.transcribedText, 'en');
          break;
        case 'translate-fr':
          await this.translateAndReset(this.transcribedText, 'fr');
          break;
        case 'translate-es':
          await this.translateAndReset(this.transcribedText, 'es');
          break;
        case 'translate-de':
          await this.translateAndReset(this.transcribedText, 'de');
          break;
        case 'translate-it':
          await this.translateAndReset(this.transcribedText, 'it');
          break;
        case 'translate-pt':
          await this.translateAndReset(this.transcribedText, 'pt');
          break;

        case 'summarize-large':
          await this.summarizeText(this.transcribedText, 'large');
          break;
        case 'summarize-medium':
          await this.summarizeText(this.transcribedText, 'medium');
          break;
        case 'summarize-small':
          await this.summarizeText(this.transcribedText, 'small');
          break;

        case 'edit':
          this.toggleEditMode();
          break;

        case 'save':
          this.saveCurrentText();
          break;

        case 'download':
          this.downloadFile('pdf');
          break;

        case 'share':
          this.openModal();
          break;
          
          case 'save':
            this.saveCurrentText();
            break;
      }

      if (loading) {
        await loading.dismiss();
      }
    }

    // Ferme les menus déroulants s'ils sont visibles
    this.translateMenuOpen = false;
    this.summarizeMenuOpen = false;
  }
    // Fonction pour détecter la langue du texte
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
  getLoadingMessage(action: string): string {
    const messages: { [key: string]: string } = {
      'translate-en': 'Translating to English...',
      'translate-fr': 'Translating to French...',
      'translate-es': 'Translating to Spanish...',
      'translate-de': 'Translating to German...',
      'translate-it': 'Translating to Italian...',
      'translate-pt': 'Translating to Portuguese...',
      'summarize-large': 'Generating large summary...',
      'summarize-medium': 'Generating medium summary...',
      'summarize-small': 'Generating short summary...'
    };
    return messages[action] || 'Processing...';
  }


sendEmail(to: string, subject: string) {
  console.log('Texte à envoyer:', this.transcribedText); // 👈 vérifie ici qu’il n’est pas vide

  const payload = {
    to,
    subject,
    text: this.transcribedText
  };

  this.http.post('http://localhost:3000/mail/send', payload).subscribe({
    next: () => this.showToast('Email envoyé !'),
    error: err => this.showToast('Erreur envoi mail')
  });
}




  async PresentLoading() {
    const loading = await this.loadingCtrl.create({
      message: this.loadingMessage,  // ✅ Utilisation du message dynamique
      spinner: 'crescent',  // ✅ Spinner Ionic
      backdropDismiss: false,  // ✅ Empêche la fermeture en cliquant dehors
    });

    await loading.present();  // ✅ Affichage du loader
    return loading;  // ✅ Retourne l'instance pour pouvoir fermer avec `loading.dismiss()`
  }



// Ferme le sous-menu Translate
hideTranslateMenu() {
  this.translateMenuOpen = false;
}
showTranslateMenu() {
  this.translateMenuOpen = !this.translateMenuOpen;
  this.summarizeMenuOpen = false;
  this.downloadMenuOpen = false;
}
Homeuser() {
  this.uploadedFile = '';
  this.uploadedFileName = '';
  this.mediaUrl = '';

  // Réinitialiser l'input file (pour éviter qu'il garde l'ancien fichier)
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = ''; // Réinitialisation de l'élément HTML input file
  }
      // Réinitialiser l'input URL
      const urlInput = document.getElementById('urlInput') as HTMLInputElement;
      if (urlInput) {
        urlInput.value = ''; // Réinitialisation de l'élément HTML input URL
      }
  this.router.navigate(['/acceuil-user']);
}


showSummarizeMenu() {
  this.summarizeMenuOpen = !this.summarizeMenuOpen;
  this.translateMenuOpen = false;
  this.downloadMenuOpen = false;
}

hideSummarizeMenu() {
  this.summarizeMenuOpen = false;
}
    // ✅ Fonction pour envoyer le texte au backend et obtenir un résumé
    summarizeText(text: string, type: string) {
      console.log(`👉 Summarizing text with level: ${type}`);

      this.isLoading = true;
      this.loadingMessage = 'Summarizing...';

      this.presentLoading().then((loading) => {
        this.http.post<any>('http://localhost:8001/summarize/', { text, type }).subscribe({
          next: (response: any) => {
            console.log('✅ Summary received:', response);
            if (response && response.summary) {
              this.transcribedText = response.summary;
            } else {
              console.error('⚠️ Invalid response format:', response);
              this.errorMessage = 'Invalid response from server';
            }
            this.isLoading = false;
            loading.dismiss();
          },
          error: (error) => {
            console.error('❌ Error generating summary:', error);
            this.errorMessage = 'Error generating the summary';
            this.isLoading = false;
            loading.dismiss();
          }
        });
      });
    }

originalText: string = ''; // 🔹 Contient toujours le texte source
// ✅ Fonction pour traduire le texte
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
isFirstTranslation: boolean = true;

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
resetText() {
  this.translatedText = null; // Effacer le texte traduit
  this.transcribedText = this.originalText; // Réinitialiser au texte original
  console.log('Text has been reset to original:', this.transcribedText);
}




  Contact() {
    this.router.navigate(['/contact']);
  }



  History() {
    this.router.navigate(['/history']);
  }


  logout() {
    // Déconnexion de l'utilisateur (peut être améliorée avec JWT plus tard)
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
    this.showLogout = false; // Cache avant action
    this.authService.logout();
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

  // Opens the email modal


// Closes the email modal
closeModal() {
  document.getElementById("emailModal")!.style.display = "none";
}


// Function to copy text when the button is clicked
async copyText() {
  const textToCopy = this.translatedText || this.transcribedText;

  try {
    // Copy the text to clipboard using Clipboard API
    await navigator.clipboard.writeText(textToCopy);

    // Show toast notification after successfully copying text
    const toast = await this.toastController.create({
      message: 'Text copied to clipboard!',
      duration: 1000,   // Duration in milliseconds (Toast disappears after 2 seconds)
      position: 'bottom', // Position of the toast
      cssClass: 'custom-toast' // Optional: Add a custom class for further styling if needed
    });

    toast.present();
  } catch (error) {
    // Handle error if copying fails (optional)
    console.error('Failed to copy text', error);

    const toast = await this.toastController.create({
      message: 'Failed to copy text.',
      duration: 1000,   // Duration of the toast (2 seconds)
      position: 'top', // Position of the toast
    });

    toast.present();
  }
}
// Fonction pour masquer le menu de téléchargement
hideDownloadMenu() {
  this.downloadMenuOpen = false;
}
// Fonction pour afficher le menu de téléchargement
showDownloadMenu() {
  this.downloadMenuOpen = !this.downloadMenuOpen;
  this.translateMenuOpen = false;
  this.summarizeMenuOpen = false;
}
/*toggleDropdown(event: Event) {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
    console.log('Dropdown toggled:', this.dropdownOpen);
  }*/

    toggleDropdown() {
      setTimeout(() => {
        this.dropdownOpen = !this.dropdownOpen;
      }, 0); // Laisse le cycle Angular finir
    }


toggleSubmenu(menu: string) {
  if (menu === 'translate') {
    this.translateMenuOpen = !this.translateMenuOpen;
    this.summarizeMenuOpen = false;
    this.downloadMenuOpen = false;
  } else if (menu === 'summarize') {
    this.summarizeMenuOpen = !this.summarizeMenuOpen;
    this.translateMenuOpen = false;
    this.downloadMenuOpen = false;
  } else if (menu === 'download') {
    this.downloadMenuOpen = !this.downloadMenuOpen;
    this.translateMenuOpen = false;
    this.summarizeMenuOpen = false;
  }
}

closeDropdownOnOutsideClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.dropdown-container') && !target.closest('ion-icon[name="menu-outline"]')) {
    this.dropdownOpen = false;
    this.translateMenuOpen = false;
    this.summarizeMenuOpen = false;
    this.downloadMenuOpen = false;
  }
}

toggleEditMode() {
  this.isEditing = !this.isEditing; // Bascule entre édition et affichage normal
}
toggleDownloadMenu(event: Event) {
  event.stopPropagation();
  this.downloadMenuOpen = !this.downloadMenuOpen;
}

@HostListener('document:click', ['$event'])
closeDownloadMenu(event: MouseEvent) {
  const clickedInside = (event.target as HTMLElement).closest('.download-menu');
  if (!clickedInside) {
    this.downloadMenuOpen = false;
  }
}
downloadFile(format: 'pdf' | 'txt') {
  const content = this.transcribedText || 'No content available';

  if (format === 'txt') {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcription.txt';
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } else if (format === 'pdf') {
    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Transcription', 105, 15, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    // Gérer les retours à la ligne
    const marginLeft = 10;
    const marginTop = 30;
    const pageWidth = doc.internal.pageSize.width - 2 * marginLeft;
    const splitText = doc.splitTextToSize(content, pageWidth);

    doc.text(splitText, marginLeft, marginTop);

    // Télécharger le fichier PDF
    doc.save('transcription.pdf');
  }

  this.downloadMenuOpen = false;
}

adjustTextareaHeight() {
  const textarea = document.querySelector('.edit-area') as HTMLTextAreaElement;
  if (textarea) {
    textarea.style.height = 'auto'; // Réinitialise la hauteur
    textarea.style.height = textarea.scrollHeight + 'px'; // Ajuste la hauteur
  }
}

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

async PresentPopover() {
  const popover = await this.popoverCtrl.create({
    component: PopoverMenuComponent,
    componentProps: {
      transcribedText: this.transcribedText // 👈 Assure-toi que cette variable contient le bon texte
    },
    translucent: true,
  });

  await popover.present();
}


openModal() {
  const payload = {
    type: this.translatedText ? 'translation' : 'transcription',
    text: this.translatedText || this.transcribedText,
  };

  this.http.post<any>('http://localhost:3000/text/generate-url', payload).subscribe(
    (res) => {
      const shareableUrl = res.url;

      // Affiche une alerte avec l'URL générée
      this.showAlert('Shareable Link', shareableUrl);
    },
    (error) => {
      console.error('Erreur lors de la génération du lien', error);
      this.showAlert('Erreur', 'Impossible de générer le lien.');
    }
  );
}

async showAlert(title: string, message: string) {
  const alert = await this.alertController.create({
    header: title,
    message: `${message}`,
    buttons: [
      {
        text: 'Copy',
        handler: () => {
          navigator.clipboard.writeText(message);
        },
      },
      {
        text: 'OK',
        role: 'cancel'
      }
    ],
    mode: 'ios'
  });
  await alert.present();
}

getFirstLetter(name: string | undefined | null): string {
  return name ? name.charAt(0).toUpperCase() : '';
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
}
