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
      this.uploadedFile = input.files[0];
      this.mediaUrl = '';
      console.log('File selected:', this.uploadedFile.name);
    }else {
        this.uploadedFile = null; // S'assurer que la valeur est bien mise à jour
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
    this.loadingMessage = 'Converting...';  // Initial "Converting..." message
    let formData = new FormData();
    let apiUrl = 'http://localhost:3000/ai/transcribe';

    if (this.uploadedFile) {
      formData.append('file', this.uploadedFile);
      console.log('Sending file:', this.uploadedFile.name);
    } else if (this.mediaUrl.trim()) {
      formData.append('url', this.mediaUrl);
      console.log('Sending URL:', this.mediaUrl);
    }

    // Show the full-page loading spinner with animated effects
    const loading = await this.loadingController.create({
      spinner: 'crescent',
      message: this.loadingMessage,
      cssClass: 'full-page-loading',  // Apply the custom full-page class
    });
    await loading.present();

    // Perform the HTTP request
    this.http.post<any>(apiUrl, formData).subscribe({
      next: (response) => {
        console.log('Response received:', response);
        this.transcribedText = response.text;
        this.router.navigate(['/view'], { queryParams: { text: this.transcribedText } });
        this.isLoading = false;
        loading.dismiss();  // Hide the loading spinner after the request completes
      },
      error: (error) => {
        console.error('Error during transcription:', error);
        alert('Error during transcription. Please check the file or URL.');
        this.isLoading = false;
        loading.dismiss();  // Hide the loading spinner on error
      }
    });

    // Change the message to "Almost done!" after a delay
    setTimeout(() => {
      this.loadingMessage = 'Almost done!';  // Update message during conversion
    }, 2000);  // Update after 2 seconds (or based on your actual process time)
  }
}
