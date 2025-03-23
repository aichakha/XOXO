import { Injectable,EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';
  userLoggedIn = new EventEmitter<void>();

  constructor(private http: HttpClient) {}

  signUp(userData: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<{
      user: any; token: string
}>(`${this.apiUrl}/login`, credentials).pipe(
    tap(response => {
      this.setToken(response.token);
      this.setUser(response.user);  // Enregistre le nom de l'utilisateur
    })
);}

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
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');

    if (!token) {
      console.log('No token found. User is NOT authenticated.');
      return false;
    }

    // Vérifier si le token est un vrai JWT et non juste une chaîne aléatoire
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      // Vérifier la date d'expiration du token
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        console.log('Token expired. User is NOT authenticated.');
        localStorage.removeItem('token'); // Supprime le token expiré
        return false;
      }

      console.log('Valid token found. User is authenticated.');
      return true;
    } catch (e) {
      console.log('Invalid token format. User is NOT authenticated.');
      return false;
    }
  }


  // ✅ Suppression du token lors de la déconnexion
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('decodedToken');
    localStorage.removeItem('user');
  }
}
