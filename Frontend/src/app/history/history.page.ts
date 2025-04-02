import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../auth/services/auth.service';
import { SavedTextService } from '../auth/services/saved-text.service';
import { lastValueFrom } from 'rxjs';
@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  searchTerm: string = '';
  userName: string = '';
  clips: any[] = [];
  filteredClips = [...this.clips];
  isLoading = false; 
  constructor(private router: Router, private authService: AuthService, private savedTextService: SavedTextService,private loadingCtrl: LoadingController,private toastCtrl: ToastController) {}
  uploadedFileName: string = '';

  uploadedFile: File | null = null;
  mediaUrl: string = '';
  isAuthenticated = false;
  username: string | null = null;
  async ngOnInit() {
    
    this.isAuthenticated = this.authService.isLoggedIn();
    console.log('🔐 Authenticated:', this.isAuthenticated);
    this.authService.username$.subscribe(digits => this.username = digits);
    this.username = localStorage.getItem('username');
    const user = localStorage.getItem('user');
    if (user) {
      this.userName = JSON.parse(user).name;
    }

    if (this.isAuthenticated) {
      await this.loadSavedTexts(); // Chargement initial des textes sauvegardés
    }
  }

  async loadSavedTexts() {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Loading your history...'
    });
    await loading.present();
  
    try {
      const userId = this.authService.getUserId();
      if (userId) {
        // Remplacement de toPromise() par lastValueFrom
        const response = await lastValueFrom(
          this.savedTextService.getSavedTexts(userId)
        );
        
        // Vérification de type et fallback
        this.clips = Array.isArray(response) ? response : [];
        this.filteredClips = [...this.clips];
      }
    } catch (error) {
      console.error('Error loading saved texts:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to load history',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      this.clips = [];
      this.filteredClips = [];
    } finally {
      await loading.dismiss();
      this.isLoading = false;
    }
  }
  
  async deleteText(id: string, event: Event) {
    event.stopPropagation();
    
    try {
      // Remplacement de toPromise() par lastValueFrom
      await lastValueFrom(this.savedTextService.deleteSavedText(id));
      
      // Mise à jour locale sans recharger
      this.clips = this.clips.filter(clip => clip.id !== id);
      this.filteredClips = [...this.clips];
      
      const toast = await this.toastCtrl.create({
        message: 'Text deleted successfully',
        duration: 2000
      });
      await toast.present();
      
    } catch (error) {
      console.error('Error deleting text:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to delete text',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }
  
  filterClips() {
    if (!this.searchTerm) {
      this.filteredClips = [...this.clips];
      return;
    }
    
    this.filteredClips = this.clips.filter(clip =>
      clip.content.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  

  loadMore() {
    this.clips.push(...this.clips);
    this.filterClips();
  }

  Contact() {
    this.router.navigate(['/contact']);
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
  logout() {
    this.authService.logout();
    this.isAuthenticated = false;
    this.username = null;
    this.router.navigate(['/']); // Redirection après déconnexion
  }

  signup() {
    // Déconnexion de l'utilisateur (peut être améliorée avec JWT plus tard)

    this.router.navigate(['signup']);
  }
  login() {
    this.router.navigate(['login']);
}
selectedClip: any = null;

selectClip(clip: any) {
  this.selectedClip = clip;
}

closeDetails() {
  this.selectedClip = null;
}



}
