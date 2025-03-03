import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';

  constructor(private http: HttpClient) {}

  signUp(userData: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(data: { email: string; token: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  // ✅ Sauvegarde du token et du token décodé
  setToken(token: string) {
    localStorage.setItem('token', token);
    try {
      const decodedToken = jwtDecode(token);
      localStorage.setItem('decodedToken', JSON.stringify(decodedToken));
    } catch (error) {
      console.error('Erreur de décodage du token:', error);
    }
  }

  // ✅ Récupération du token encodé
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ✅ Récupération du token décodé
  getDecodedToken(): any {
    const decodedToken = localStorage.getItem('decodedToken');
    return decodedToken ? JSON.parse(decodedToken) : null;
  }

  // ✅ Vérifie si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ✅ Suppression du token lors de la déconnexion
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('decodedToken');
  }
}
