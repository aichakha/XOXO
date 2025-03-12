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
  
    let apiUrl = this.uploadedFile ? 'http://localhost:3000/ai/transcribe' : 'http://localhost:3000/ai/process';
    let requestData: any;
    let options: any = {}; // Options par défaut
  
    if (this.uploadedFile) {
      let formData = new FormData();
      formData.append('file', this.uploadedFile);
      requestData = formData;
      // Pas de 'Content-Type', Angular le gère automatiquement
    } else if (this.mediaUrl.trim()) {
      requestData = { url: this.mediaUrl };
      options.headers = { 'Content-Type': 'application/json' }; // Définition ici uniquement pour JSON
    }
  
    const loading = await this.loadingController.create({
      spinner: 'crescent',
      message: this.loadingMessage,
      cssClass: 'full-page-loading',
    });
    await loading.present();
  
    this.http.post<{ text: string }>(apiUrl, requestData, {
      headers: { 'Content-Type': 'application/json' }, // 🔹 Ajout de l'en-tête
      observe: 'response' // 🔹 On veut récupérer l'objet `HttpResponse`
    }).subscribe({
      next: (response) => {
        if (response.body) {  // 🔹 Vérifier que le `body` existe
          console.log('Response received:', response.body);
          this.transcribedText = response.body.text; // ✅ Plus d'erreur ici
          this.router.navigate(['/view'], { queryParams: { text: this.transcribedText } });
        } else {
          console.error('Response body is empty');
          alert('Error: Empty response from server.');
        }
        this.isLoading = false;
        loading.dismiss();
      },
      error: (error) => {
        console.error('Error during transcription:', error);
        alert('Error during transcription. Please check the file or URL.');
        this.isLoading = false;
        loading.dismiss();
      }
    });
    
    
  
    setTimeout(() => {
      this.loadingMessage = 'Almost done!';
    }, 2000);
  }
  
}
