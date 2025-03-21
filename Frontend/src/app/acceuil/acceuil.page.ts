import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../auth/services/auth.service';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { LoadingController } from '@ionic/angular';  // <-- Import LoadingController

@Component({
  selector: 'app-acceuil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  templateUrl: './acceuil.page.html',
  styleUrls: ['./acceuil.page.scss'],
})
export class AcceuilPage {
  uploadedFileName: string = '';
  transcribedText: string = '';
  uploadedFile: File | null = null;
  mediaUrl: string = '';
  isLoading: boolean = false;  // Flag to track the loading state
  loadingMessage: string = 'Converting...';  // Message during conversion

  login() {
    this.router.navigate(['/login']);
  }
  userName: string = '';

  constructor(private router: Router, private authService: AuthService,private http: HttpClient,  private loadingCtrl: LoadingController,private loadingController: LoadingController

  ) {}

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


  view() {
    if (this.transcribedText) {
      this.router.navigate(['/view'], { queryParams: { text: this.transcribedText } });
    } else {
      alert("Aucun fichier ou lien n'a été fourni !");
    }
  }


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
  History() {
    this.router.navigate(['/history']);
  }
  Contact() {
    this.router.navigate(['/contact']);
  }


  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadedFile = file;
      this.uploadedFileName = file.name; // Stocke le nom du fichier
      this.mediaUrl = ''; // Efface l'URL si un fichier est sélectionné

      console.log('Fichier sélectionné :', this.uploadedFileName);
    } else {
      this.uploadedFile = null;
      this.uploadedFileName = ''; // Efface le nom s'il n'y a pas de fichier
    }
  }

  // Vérifier si un fichier a été uploadé ou si une URL est fournie

    triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }






  // Show full-page loading spinner
  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Converting...',  // Custom message
      spinner: 'crescent',  // Spinner type
      cssClass: 'full-page-loading',  // Custom CSS class to style the full page spinner
      backdropDismiss: false,  // Disable dismiss when clicked outside
    });

    await loading.present();  // Show the loading spinner
    return loading;  // Return the loading instance
  }

  canConvert(): boolean {
    return !!this.uploadedFile || (!!this.mediaUrl && this.mediaUrl.trim().length > 0);
  }

  async convertToText() {
    if (!this.canConvert()) {
      alert('Please select a file or enter a URL before continuing.');
      return;
    }

    this.isLoading = true;
    this.loadingMessage = 'Converting...';

    let formData = new FormData();
    let apiUrl = '';

    if (this.uploadedFile) {
      apiUrl = 'http://localhost:3000/ai/transcribe';  // 🔹 Envoi du fichier
      formData.append('file', this.uploadedFile);
      console.log('📤 Envoi du fichier:', this.uploadedFile.name);

      const loading = await this.loadingController.create({
        spinner: 'crescent',
        message: this.loadingMessage,
        cssClass: 'full-page-loading',
      });
      await loading.present();

      this.http.post<any>(apiUrl, formData).subscribe({
        next: (response) => {
          console.log('✅ Réponse reçue:', response);
          this.transcribedText = response.text;
          this.router.navigate(['/view'], { queryParams: { text: this.transcribedText } });
          this.isLoading = false;
          loading.dismiss();
        },
        error: (error) => {
          console.error('🚨 Erreur de transcription:', error);
          alert('Erreur lors de la transcription. Vérifiez le fichier ou l\'URL.');
          this.isLoading = false;
          loading.dismiss();
        }
      });

      // Mise à jour du message après un délai
      setTimeout(() => {
        this.loadingMessage = 'Almost done!';
      }, 2000);

    } else if (this.mediaUrl.trim()) {
      apiUrl = 'http://localhost:3000/ai/process';  // 🔹 Envoi de l'URL
      const requestBody = { url: this.mediaUrl };
      console.log('🌍 Envoi de l\'URL:', this.mediaUrl);

      const loading = await this.loadingController.create({
        spinner: 'crescent',
        message: this.loadingMessage,
        cssClass: 'full-page-loading',
      });
      await loading.present();

      this.http.post<any>(apiUrl, requestBody, { headers: { 'Content-Type': 'application/json' } })
    .subscribe({
      next: (response) => {
        console.log('✅ Réponse reçue:', response);
        this.transcribedText = response.text;
        this.router.navigate(['/view'], { queryParams: { text: this.transcribedText } });
        this.isLoading = false;
        loading.dismiss();
      },
      error: (error) => {
        console.error('🚨 Erreur de transcription:', error);
        alert('Erreur lors de la transcription. Vérifiez le fichier ou l\'URL.');
        this.isLoading = false;
        loading.dismiss();
      }
    });
    }


  }


}
