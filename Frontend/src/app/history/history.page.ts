import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

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
  clips = [
    { name: 'Name', username: 'username', text: 'There\'s no other program...', date: '22.03.2021' },
    { name: 'Name', username: 'username', text: 'There\'s no other program...', date: '22.03.2021' },
    { name: 'Name', username: 'username', text: 'There\'s no other program...', date: '22.03.2021' }
  ];
  filteredClips = [...this.clips];

  constructor(private router: Router) {}

  ngOnInit() {
    const user = localStorage.getItem('user');
    if (user) {
      this.userName = JSON.parse(user).name;
    }
  }

  filterClips() {
    this.filteredClips = this.clips.filter(clip =>
      clip.text.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  loadMore() {
    this.clips.push(...this.clips);
    this.filterClips();
  }

  Contact() {
    this.router.navigate(['/contact']);
  }

  Home() {
    this.router.navigate(['/acceuil']);
  }
  History() {
    this.router.navigate(['/history']);
  }
  logout() {
    // Déconnexion de l'utilisateur (peut être améliorée avec JWT plus tard)
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
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
