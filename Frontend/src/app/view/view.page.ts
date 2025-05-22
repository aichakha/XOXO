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
import { Filesystem, Directory,Encoding  } from '@capacitor/filesystem';
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

  selectedLanguage: string = 'fr'; 
  detectedLanguage: string = 'en';
  uploadedFileName: string | null = null;
  mediaUrl: string="";
  uploadedFile: string | null = "";
  summarizeMenuOpen = false;
  dropdownOpen = false;
  showLogout = false; 
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



  constructor(private router: Router,private alertCtrl: AlertController,
     private route: ActivatedRoute,
   private http: HttpClient,
   private savedTextService: SavedTextService,
   private loadingCtrl: LoadingController,
    private loadingController: LoadingController,
    private toastController: ToastController, 
    private authService: AuthService, 
    private alertController:AlertController,
    private popoverCtrl: PopoverController  ) {}

  showSummary: boolean = false; 
  ngOnInit() {
    this.isAuthenticated = this.authService.isLoggedIn();
    console.log('🔐 Authenticated:', this.isAuthenticated);
    this.authService.username$.subscribe(digits => this.username = digits);
    this.username = localStorage.getItem('username');
    console.log('🔑 Username:', this.username);
    this.route.queryParams.subscribe({
      next: (params) => {
        this.transcribedText = params['text'] || 'No transcribed text available';
      
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

   
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; 
    }

  
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
        transcribedText: this.transcribedText 
      }
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();

    if (data) {
      let loading = null;


      const actionsWithLoading = [
        'translate-en', 'translate-fr', 'translate-es',
        'translate-de', 'translate-it', 'translate-ar',
        'summarize-basic', 'summarize-advanced'
      ];

      if (actionsWithLoading.includes(data)) {
        this.loadingMessage = this.getLoadingMessage(data); 
        loading = await this.loadingCtrl.create({
          message: this.loadingMessage,
          spinner: 'crescent',
          backdropDismiss: false
        });
        await loading.present();
      }

    
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
        case 'translate-ar':
          await this.translateAndReset(this.transcribedText, 'ar');
          break;

        case 'summarize-advanced':
          await this.summarizeAndReset(this.transcribedText, 'advanced');
          break;
        case 'summarize-basic':
          await this.summarizeAndReset(this.transcribedText, 'basic');
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

   
    this.translateMenuOpen = false;
    this.summarizeMenuOpen = false;
  }
   
  detectLanguage(text: string) {

    this.http.post<any>('https://api.detectlanguage.com/0.2/detect', {
      q: text
    }).subscribe({
      next: (response) => {
        this.detectedLanguage = response.data.detections[0].language; 
        console.log('Detected language:', this.detectedLanguage);
      },
      error: (error) => {
        console.error('Error detecting language:', error);
        this.detectedLanguage = 'en'; 
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
      'translate-ar': 'Translating to arabic...',
      'summarize-large': 'Generating large summary...',
      'summarize-medium': 'Generating medium summary...',
      'summarize-small': 'Generating short summary...'
    };
    return messages[action] || 'Processing...';
  }


sendEmail(to: string, subject: string) {
  console.log('Texte à envoyer:', this.transcribedText); 

  const payload = {
    to,
    subject,
    text: this.transcribedText
  };

  this.http.post('https://d141-102-158-116-161.ngrok-free.app/mail/send', payload).subscribe({
    next: () => this.showToast('Email envoyé !'),
    error: err => this.showToast('Erreur envoi mail')
  });
}

  async PresentLoading() {
    const loading = await this.loadingCtrl.create({
      message: this.loadingMessage, 
      spinner: 'crescent', 
      backdropDismiss: false, 
    });

    await loading.present();  
    return loading; 
  }

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

 
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = ''; 
  }
   
      const urlInput = document.getElementById('urlInput') as HTMLInputElement;
      if (urlInput) {
        urlInput.value = ''; 
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
 
   /* summarizeText(text: string, type: string) {
      console.log(`👉 Summarizing text with level: ${type}`);

      this.isLoading = true;
      this.loadingMessage = 'Summarizing...';

      this.presentLoading().then((loading) => {
        this.http.post<any>('https://8ba2-102-158-116-161.ngrok-free.app/summarize/', { text, type }).subscribe({
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
*/
isFirstSummary: boolean = true;
summarizeAndReset(text: string, type: string) {
  if (!this.originalText) {
    this.originalText = this.transcribedText;
  }

  if (this.isFirstSummary) {
    this.isFirstSummary = false;
  } else {
    this.transcribedText = this.originalText;
  }

  console.log('Text has been reset to transcribed (original):', this.transcribedText);

  this.summarizeText(this.transcribedText, type);
}
summarizeText(text: string, summary_type: string , max_input_len: number = 2048) {
  console.log(`👉 Summarizing text with level: ${summary_type}`);

  this.isLoading = true;
  this.loadingMessage = 'Summarizing...';
  this.errorMessage = '';

  const payload = {
    text: text,
    summary_type: summary_type,
    max_input_len: max_input_len
  };

  this.presentLoading().then((loading) => {
    this.http.post<any>('https://8ba2-102-158-116-161.ngrok-free.app/summarize/', payload).subscribe({
      next: (response) => {
        console.log('✅ Summary received:', response);

        if (response && response.summary) {
          this.transcribedText = response.summary;

          // Si tu veux "revenir au texte original" pour la prochaine génération
          // réinitialise ici si nécessaire (par exemple stocker le texte original dans une variable séparée)
          // this.originalText = text;

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

originalText: string = ''; 

async canTranslate(text: string): Promise<boolean> {
  const wordCount = text.trim().split(/\s+/).length;

  if (wordCount <= 400) {
    return true;
  } else {
    const toast = await this.toastController.create({
      message: ' Please do Summarize first (text must be between 200 and 400 words)',
      duration: 3000,
      color: 'warning',
      //position: 'top'
    });
    await toast.present();
    return false;
  }
}
async translateText(text: string, targetLang: string) {
  const canTranslate = await this.canTranslate(text);
  if (!this.canTranslate(text)) return;
  if (!canTranslate) return;
  console.log('👉 Translating text:', text, 'to:', targetLang);
  if (!text || !targetLang) return;
  this.originalText = text; 
  this.isLoading = true;
  this.loadingMessage = 'Translating...';
  this.presentLoading1().then((loading) => {
    this.http.post<any>('https://d141-102-158-116-161.ngrok-free.app/translate', {
      text: this.originalText,

      srcLang: this.detectedLanguage, 
      tgtLang: targetLang
    }).subscribe({
      next: (response) => {
        console.log('✅ Translation received:', response);
        this.transcribedText = response.translation; 
        this.isLoading = false;
        loading.dismiss(); 
      },
      error: (error) => {
        console.error('❌ Error translating:', error);
        this.errorMessage = 'Erreur lors de la traduction.';
        this.isLoading = false;
        loading.dismiss(); 
      }
    });
  });
}
isFirstTranslation: boolean = true;

translateAndReset(text: string, targetLang: string) {
  if (!this.originalText) {
    this.originalText = this.transcribedText; 
  }
  if (this.isFirstTranslation) {
    this.isFirstTranslation = false;  
  } else {
  
    this.translatedText = null;  
  }

  
  this.transcribedText = this.originalText;

  console.log('Text has been reset to transcribed (original):', this.transcribedText);

  
  this.translateText(this.transcribedText, targetLang);
}
async presentLoading1() {
  const loading = await this.loadingCtrl.create({
    message: 'Translating...', 
    spinner: 'crescent',  
    cssClass: 'full-page-loading',  
    backdropDismiss: false,
  });

  await loading.present();  
  return loading;  
}
resetText() {
  this.translatedText = null; 
  this.transcribedText = this.originalText;
  console.log('Text has been reset to original:', this.transcribedText);
}




  Contact() {
    this.router.navigate(['/contact']);
  }



  History() {
    this.router.navigate(['/history']);
  }


  logout() {

    localStorage.removeItem('user');
    this.router.navigate(['/login']);
    this.showLogout = false; 
    this.authService.logout();
  }




  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const clickedInside = (event.target as HTMLElement).closest('.dropdown');
    if (!clickedInside) {
      this.dropdownOpen = false;
    }
  }

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Summarizing...',  
      spinner: 'crescent', 
      cssClass: 'full-page-loading', 
      backdropDismiss: false,  
    });

    await loading.present();  
    return loading; 
  }

closeModal() {
  document.getElementById("emailModal")!.style.display = "none";
}



async copyText() {
  const textToCopy = this.translatedText || this.transcribedText;

  try {
   
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

hideDownloadMenu() {
  this.downloadMenuOpen = false;
}

showDownloadMenu() {
  this.downloadMenuOpen = !this.downloadMenuOpen;
  this.translateMenuOpen = false;
  this.summarizeMenuOpen = false;
}
    toggleDropdown() {
      setTimeout(() => {
        this.dropdownOpen = !this.dropdownOpen;
      }, 0); 
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
  this.isEditing = !this.isEditing; 
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
async downloadFile(format: 'pdf' | 'txt') {
  const content = this.transcribedText || 'No content available';
  if (format === 'txt') {
    try {
      await Filesystem.writeFile({
        path: 'transcription.txt',
        data: content,
        directory: Directory.Documents,
        encoding: Encoding.UTF8, 
      });
      alert('TXT file saved in Documents.');
    } catch (e: unknown) {
      console.error('TXT save error:', e);
      alert('Error saving TXT.');
    }
  } else if (format === 'pdf') {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Transcription', 105, 15, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const marginLeft = 10;
    const marginTop = 30;
    const pageWidth = doc.internal.pageSize.width - 2 * marginLeft;
    const splitText = doc.splitTextToSize(content, pageWidth);
    doc.text(splitText, marginLeft, marginTop);
    try {
      const pdfBlob = doc.output('blob');
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result?.toString().split(',')[1];
          if (base64data) {
            resolve(base64data);
          } else {
            reject(new Error('Failed to convert PDF to base64'));
          }
        };
        reader.readAsDataURL(pdfBlob);
      });
      const now = new Date();
      const timestamp = now.getFullYear().toString() + '.'+
                    (now.getMonth() + 1).toString().padStart(2, '0') +'.'+
                    now.getDate().toString().padStart(2, '0') ;

      console.log('Taille des données base64:', base64Data.length);
      const result = await Filesystem.writeFile({
        path: `transcription_${timestamp}.pdf`,
        data: base64Data,
        directory: Directory.Documents
      });
      console.log('Fichier enregistré avec succès:', result);
      alert('PDF file saved in Documents.');
    } catch (e: unknown) {
      console.error('PDF save error:', e);
      let errorMessage = 'Unknown error';
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === 'object' && e !== null && 'message' in e) {
        errorMessage = (e as { message: string }).message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      }
      alert(`Error saving PDF: ${errorMessage}`);
    }
  }
  this.downloadMenuOpen = false;
}
adjustTextareaHeight() {
  const textarea = document.querySelector('.edit-area') as HTMLTextAreaElement;
  if (textarea) {
    textarea.style.height = 'auto'; 
    textarea.style.height = textarea.scrollHeight + 'px'; 
  }
}

async saveCurrentText() {
  const content = this.translatedText || this.transcribedText;
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
      transcribedText: this.transcribedText 
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

  this.http.post<any>('https://d141-102-158-116-161.ngrok-free.app/text/generate-url', payload).subscribe(
    (res) => {
      const shareableUrl = res.url;

     
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
