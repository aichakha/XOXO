import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../auth/services/auth.service';
import { HttpClient } from '@angular/common/http'; // Import HttpClient

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

  login() {
    this.router.navigate(['/login']);
  }
  userName: string = '';

  constructor(private router: Router, private authService: AuthService,private http: HttpClient) {}

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
  canConvert(): boolean {
    return !!this.uploadedFile || (!!this.mediaUrl && this.mediaUrl.trim().length > 0);
  }

  convertToText() {
    if (!this.canConvert()) {
      alert('Veuillez sélectionner un fichier ou entrer une URL avant de continuer.');
      return;
    }

    let formData = new FormData();
    let apiUrl = 'http://localhost:3000/ai/transcribe';

    if (this.uploadedFile) {
      formData.append('file', this.uploadedFile);
      console.log('Envoi du fichier:', this.uploadedFile.name);
      console.log("📤 Type MIME:", this.uploadedFile.type);
    } else if (this.mediaUrl.trim()) {
      formData.append('url', this.mediaUrl);
      console.log('Envoi de l’URL:', this.mediaUrl);
    }
    console.log("🔄 Envoi de la requête à", apiUrl);
    this.http.post<any>(apiUrl, formData).subscribe({
      next: (response) => {
        console.log("✅ Réponse reçue:", response);
        this.transcribedText = response.text;
        this.router.navigate(['/view'], { queryParams: { text: this.transcribedText } });
      },
      error: (error) => {
        console.error('Erreur lors de la transcription:', error);
        alert("Erreur lors de la transcription. Vérifiez l'URL ou le fichier.");
      }
    });
  }
}

