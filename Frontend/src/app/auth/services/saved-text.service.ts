import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SavedTextService {
  //private baseUrl = `${environment.apiUrl}/saved-text`;
  private baseUrl = 'http://localhost:3000/saved-text';
  constructor(private http: HttpClient,private authService: AuthService) {}

  private getRequestOptions() {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No token available');
    }
  
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true // Important pour les cookies
    };
  }

  saveText(data: { userId: string, content: string }): Observable<any> {
    const options = this.getRequestOptions();
    console.log('Sending to:', this.baseUrl, 'Data:', data,'Request headers:', options.headers);
    return this.http.post(this.baseUrl, data, options).pipe(
      catchError(this.handleError)
    );
  }

  getSavedTexts(userId: string): Observable<any> {
    const options = this.getRequestOptions();
    console.log('Request options:', options); // Debug
    return this.http.get(`${this.baseUrl}/${userId}`, options).pipe(
      catchError(this.handleError)
    );
  }

 


  deleteSavedText(id: string): Observable<any> {
    const options = this.getRequestOptions(); // Ajout des options d'authentification
    console.log('Delete request options:', options); // Pour débogage
    
    return this.http.delete(`${this.baseUrl}/${id}`, options).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server-side error: ${error.status} ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  updateSavedText(id: string, data: { title?: string; content?: string }): Observable<any> {
    const options = this.getRequestOptions(); // Ajoutez cette ligne
    console.log('Update request options:', options); // Pour débogage
    
    return this.http.patch(`${this.baseUrl}/${id}`, data, options).pipe( // Ajoutez options ici
      catchError(this.handleError)
    );
  }

  toggleFavorite(id: string, isFavorite: boolean): Observable<any> {
    const options = this.getRequestOptions(); // Authentification
    return this.http.patch(`${this.baseUrl}/${id}/favorite`, { isFavorite }, options);
  }
  
  getFavorites(userId: string): Observable<any[]> {
    const options = this.getRequestOptions();
    return this.http.get<any[]>(`${this.baseUrl}/${userId}/favorites`, options);
  }
  
}
