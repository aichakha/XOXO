import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../auth/services/auth.service';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Import HttpClient

@Component({
  selector: 'app-acceuil-user',

  templateUrl: './acceuil-user.page.html',
  styleUrls: ['./acceuil-user.page.scss'],
  standalone: true,
  imports: [
      IonHeader,
      CommonModule,
      FormsModule,
      IonicModule]
})
export class AcceuilUserPage implements OnInit {
  isAuthenticated = false;
  username: string | null = null;



  constructor(private router: Router, private authService: AuthService,              private loadingCtrl: LoadingController,
                private loadingController: LoadingController,
                private alertCtrl: AlertController,
                private http: HttpClient) { }
  uploadedFileName: string = '';
  uploadedFile: File | null = null;
  mediaUrl: string = '';
  isLoading: boolean = false;  // Flag to track the loading state
  loadingMessage: string = 'Converting...';  // Message during conversion
  transcribedText: string = '';
  ngOnInit() {
    this.isAuthenticated = this.authService.isLoggedIn();
    console.log('🔐 Authenticated:', this.isAuthenticated);
    this.authService.username$.subscribe(digits => this.username = digits);
    this.username = localStorage.getItem('username');
  }
  logout() {
    this.authService.logout();
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);}
    triggerFileInput() {
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
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


  canConvert(): boolean {
    return !!this.uploadedFile || (!!this.mediaUrl && this.mediaUrl.trim().length > 0);
  }
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
      apiUrl = 'http://localhost:3000/ai/transcribe';
      formData.append('file', this.uploadedFile);

      const loading = await this.loadingController.create({
        spinner: 'crescent',
        message: this.loadingMessage,
        cssClass: 'full-page-loading',
      });
      await loading.present();

      const token = this.authService.getToken();
      if (!token) {
        alert('Erreur : Token non disponible. Connectez-vous.');
        return;
      }

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });


      this.http.post<{ text: string }>(apiUrl, formData, { headers }).subscribe({
        next: (response) => {
          console.log('✅ Réponse reçue:', response);
          if (response.text) {
            this.transcribedText = response.text;
            this.router.navigate(['/view'], { queryParams: { text: this.transcribedText } });
          } else {
            alert("La transcription a échoué.");
          }
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

    } else if (this.mediaUrl.trim()) {
      apiUrl = 'http://localhost:3000/ai/process';
      const requestBody = { url: this.mediaUrl };

      const loading = await this.loadingController.create({
        spinner: 'crescent',
        message: this.loadingMessage,
        cssClass: 'full-page-loading',
      });
      await loading.present();


      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.authService.getToken()}`,
      };

      this.http.post<{ text: string }>(apiUrl, requestBody, { headers }).subscribe({
        next: (response) => {
          console.log('✅ Réponse reçue:', response);
          if (response.text) {
            this.transcribedText = response.text;
            this.router.navigate(['/view'], { queryParams: { text: this.transcribedText } });
          } else {
            alert("La transcription a échoué.");
          }
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
