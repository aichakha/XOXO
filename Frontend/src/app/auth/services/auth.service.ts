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

  login(email: string, password: string): Observable<{ token: string, username: string, userId: string }> {
    return this.http.post<{ token: string, username: string, userId: string }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        console.log('✅ Réponse serveur:', response);

        if (response.token) {
          console.log('✅ Login successful:', response);

          // 🔹 Stocker le token JWT
          localStorage.setItem('token', response.token);

          // 🔹 Stocker le nom d'utilisateur (ou 4 derniers chiffres)
          localStorage.setItem('username', response.username);
          this.username$.next(response.username);
          localStorage.setItem('userId', response.userId);
          // 🔹 Mettre à jour l'état d'authentification
          this.isAuthenticated.next(true);

          // 🔹 Redirection vers la page d'accueil utilisateur
          this.router.navigate(['/acceuil-user']);
        } else {
          console.error('🚨 Aucun token reçu.');
        }
      })
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
    return localStorage.getItem('token'); // Récupère le token JWT
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
    const token = localStorage.getItem('token'); // Utiliser 'token' au lieu de 'authToken'
    return !!token;
  }
  //recuperer le username
  getLast4Digits(): string | null {
    return localStorage.getItem('last4Digits');
  }

  // ✅ Suppression du token lors de la déconnexion
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('token'); // Supprime seulement 'token'
    localStorage.removeItem('decodedToken');
    localStorage.removeItem('username');
    this.isAuthenticated.next(false);
    this.last4Digits.next(null);
    this.router.navigate(['/acceuil']);
  }
// auth.service.ts
getUserId(): string | null {
  const token = this.getToken();
  if (!token) return null;
  
  try {
    const decoded: any = jwtDecode(token); // Utilisez jwt-decode
    console.log('Decoded Token:', decoded);
    return decoded.sub; // Ou le champ où vous stockez l'ID utilisateur
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

loginWithGoogle(googleToken: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/google-login`, { token: googleToken }).pipe(
    tap(response => {
      if (response.token) {
        // Store JWT token
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
        this.isAuthenticated.next(true);
        this.router.navigate(['/acceuil-user']);
      } else {
        console.error('No token received from server');
      }
    })
  );
}


}

