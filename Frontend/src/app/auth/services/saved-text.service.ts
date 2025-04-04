import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SavedTextService {
  //private baseUrl = `${environment.apiUrl}/saved-text`;
  private baseUrl = 'http://localhost:3000/saved-text';
  constructor(private http: HttpClient) {}

  saveText(data: { userId: string, content: string }): Observable<any> {
    console.log('Sending to:', this.baseUrl, 'Data:', data);
    return this.http.post(this.baseUrl, data).pipe(
      catchError(this.handleError)
    );
  }

  getSavedTexts(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

 


  deleteSavedText(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
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
    return this.http.patch(`${this.baseUrl}/${id}`, data).pipe(
      catchError(this.handleError) // Ajoutez la gestion d'erreur comme pour les autres méthodes
    );
  }
}
