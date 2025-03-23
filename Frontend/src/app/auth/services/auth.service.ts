import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';



@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';

  private isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticated.asObservable();
  private last4Digits = new BehaviorSubject<string | null>(null);
  username$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient,private router: Router) {}

  signUp(userData: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  login(email: string, password: string): Observable<{ token: string,  username: string  }> {
    return this.http.post<{ token: string, username: string  }>(`${this.apiUrl}/login`, { email, password })
      .pipe( // Optionnel: Ajout d'un log pour debug
        tap(response =>{
          localStorage.setItem('authToken', response.token); // Stocker le token
          localStorage.setItem('username', response.username); // Stocker les 4 derniers chiffres
          this.username$.next(response.username); // Stocker les 4 derniers chiffres
          this.isAuthenticated.next(true); // Met à jour l'état d'authentification
          this.router.navigate(['/acceuil-user']); })// 🔹 Redirection vers la page des utilisateurs connectés
      );
    }


  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(data: { email: string; token: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  // ✅ Sauvegarde du token et du token décodé
  SetToken(token: string) {
    localStorage.setItem('token', token);
    try {
      const decodedToken = jwtDecode(token);
      localStorage.setItem('decodedToken', JSON.stringify(decodedToken));
    } catch (error) {
      console.error('Erreur de décodage du token:', error);
    }
  }
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }




  // ✅ Récupération du token encodé
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
    console.log('User stored in localStorage:', localStorage.getItem('user'));
  }

  // ✅ Récupération du token décodé
  getDecodedToken(): any {
    const decodedToken = localStorage.getItem('decodedToken');
    return decodedToken ? JSON.parse(decodedToken) : null;
  }

  // ✅ Vérifie si l'utilisateur est authentifié
  isLoggedIn(): boolean {
    const token = localStorage.getItem('authToken'); // Récupérer le token stocké
    return !!token; // Retourne true si le token existe, sinon false
  }
  //recuperer le username
  getLast4Digits(): string | null {
    return localStorage.getItem('last4Digits');
  }

  // ✅ Suppression du token lors de la déconnexion
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('decodedToken');
    localStorage.removeItem('username');
    this.isAuthenticated.next(false);
    this.last4Digits.next(null);
    this.router.navigate(['/acceuil']);
  }
}
