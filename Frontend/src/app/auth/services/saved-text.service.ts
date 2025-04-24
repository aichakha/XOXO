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
  private categoryUrl = 'http://localhost:3000/categories';
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
  updateTextContent(id: string, content: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, { content }, this.getRequestOptions());
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

  assignCategoryToText(textId: string, categoryId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${textId}/assign-category/${categoryId}`, {}, this.getRequestOptions());
  }

  removeCategoryFromText(textId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${textId}/remove-category`, {}, this.getRequestOptions());
  }

  changeCategory(textId: string, newCategoryId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${textId}/change-category/${newCategoryId}`, {}, this.getRequestOptions());
  }

  // Category service methods
  createCategory(name: string, userId: string): Observable<any> {
    return this.http.post(this.categoryUrl, { name, userId }, this.getRequestOptions());
  }

  getUserCategories(userId: string): Observable<any> {
    return this.http.get(`${this.categoryUrl}/${userId}`, this.getRequestOptions());
  }

  updateCategory(id: string, name: string): Observable<any> {
    return this.http.patch(`${this.categoryUrl}/${id}`, { name }, this.getRequestOptions());
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.categoryUrl}/${id}`, this.getRequestOptions());
  }
  //for pinned
   // 🟢 Récupérer tous les textes
   getAllTexts(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${userId}`,this.getRequestOptions());
  }

  // 🔶 Récupérer les textes épinglés
  getPinnedTexts(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/pinned/${userId}`,this.getRequestOptions());
  }

  // 🔁 Changer l'état "pinned"
  updatePinStatus(id: string, isPinned: boolean): Observable<any> {
    return this.http.patch(`${this.baseUrl}/pin/${id}`, { isPinned },this.getRequestOptions());
  }
}
