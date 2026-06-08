import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { throwError } from 'rxjs/internal/observable/throwError';
import { catchError, tap, filter, map } from 'rxjs/operators';
import { Contact } from '../Entites/Contact.Entites';
import { BehaviorSubject } from 'rxjs';
import { Offre } from '../Entites/Offre.Entites';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Postulation } from '../Entites/Postulation.Entites';

@Injectable({
  providedIn: 'root'
})
export class CRUDService {

  GoogleUrl = 'http://localhost:8081/api/institution/signin-google';  // URL pour l'auth Google (à adapter)
  private apiUrl = 'http://localhost:8081/api';  // sans /api pour plus de flexibilité
  fastApiUrl = "http://127.0.0.1:8080";
  private httpOptions = {};
private contactsSubject = new BehaviorSubject<Contact[]>([]);
  contacts$ = this.contactsSubject.asObservable();
   private jwtHelper = new JwtHelperService();
constructor(public http: HttpClient) { }

  // CREATE - Ajouter un nouvel élément
  // ──────────────────────────────────────────────
   // CREATE - Ajouter un nouvel élément avec options
 create<T>(endpoint: string, item: T, options?: any): Observable<any> {
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  const url = `${this.apiUrl}/${cleanEndpoint}`;

  console.log('URL finale envoyée :', url);
  console.log('Payload envoyé :', item);

  return this.http.post<any>(url, item, options).pipe(
    catchError(this.handleError)
  );
}

  addContact(contact: Contact): Observable<Contact> {
    return this.http.post<Contact>(`${this.apiUrl}/contact`, contact).pipe(
      tap(newcontact => {
        const current = this.contactsSubject.value;
        this.contactsSubject.next([...current, newcontact]);
      })
    );
  }

  // ──────────────────────────────────────────────
  // READ ONE - Récupérer un élément par ID
  // ──────────────────────────────────────────────
 getById<T>(endpoint: string, id: number | string): Observable<T> {
  return this.http.get<T>(`${this.apiUrl}/${endpoint}/${id}`, this.httpOptions)
    .pipe(catchError(this.handleError));
}

  // ──────────────────────────────────────────────
  // UPDATE - Modifier un élément existant
  // ──────────────────────────────────────────────
  update<T>(endpoint: string, id: number | string, item: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}/${id}`, item, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ──────────────────────────────────────────────
  // DELETE - Supprimer un élément
  // ──────────────────────────────────────────────
  delete(endpoint: string, id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${endpoint}/${id}`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ──────────────────────────────────────────────
  // Gestion centralisée des erreurs HTTP
  // ──────────────────────────────────────────────
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inconnue est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client (ex: problème réseau)
      errorMessage = `Erreur client : ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code erreur : ${error.status}\nMessage : ${error.message}`;
      
      // Si le backend renvoie un message clair (ex: { message: "..." })
      if (error.error?.message) {
        errorMessage += `\nDétail : ${error.error.message}`;
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
// Dans crud.service.ts
// Dans CRUDService
login(endpoint: string, credentials: { email: string; mdp: string }): Observable<any> {
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  const url = `${this.apiUrl}/${cleanEndpoint}`;

  console.log('URL login finale :', url);
   const payload = {
    email: credentials.email,
    mdp: credentials.mdp
  };
  return this.http.post<any>(url, payload).pipe(
    catchError(err => {
      console.error('Erreur login :', err);
      let msg = 'Email ou mot de passe incorrect.';
      if (err.status === 0) msg = 'Impossible de contacter le serveur (CORS)';
      else if (err.error?.message) msg = err.error.message;
      return throwError(() => new Error(msg));
    })
  );
}
 // ────────────────────────────────────────────────
  //                  Authentification
  // ────────────────────────────────────────────────
  loginAdmin(admin: { email: string; mdp: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/login`, admin);
  }

 
 addUser(userData: any): Observable<any> {
  const role = userData.role?.toUpperCase() || '';

  let endpoint: string;

  switch (role) {
    case 'ETUDIANT':
      endpoint = '/etudiant';          // POST /etudiant
      break;
    case 'CANDIDAT':
      endpoint = '/candidat';          // POST /candidat
      break;
    case 'ENTREPRISE':
      endpoint = '/entreprise';        // POST /entreprise
      break;
    case 'INSTITUTION':
      endpoint = '/institution';       // POST /institution
      break;
    default:
      console.error('Rôle invalide:', role);
      return throwError(() => new Error('Rôle non supporté'));
  }

  const fullUrl = `${this.apiUrl}${endpoint}`;
  console.log('Tentative POST vers:', fullUrl);  // ← debug important

  return this.http.post<any>(fullUrl, userData).pipe(
    catchError(err => {
      console.error('Erreur HTTP détaillée:', err);
      return throwError(() => err);
    })
  );
}
signInWithGoogle(idToken: string): Observable<any> {
  const params = new HttpParams().set('id_token', idToken);
  return this.http.post(this.GoogleUrl, null, { params });

}
improveDescription(descriptionData: any): Observable<any> {
    return this.http.post(`${this.fastApiUrl}/improve-description`, descriptionData);
  }
createOffre(entrepriseId: number, formData: FormData): Observable<any> {
  return this.http.post<any>(
    `${this.apiUrl}/offres/entreprise/${entrepriseId}`, 
    formData
    // NE PAS mettre { headers } ou Content-Type manuellement → Angular le gère automatiquement
  ).pipe(
    catchError(err => {
      console.error('Erreur détaillée création offre :', err);
      console.error('Body erreur :', err.error);
      return throwError(() => err);
    })
  );
}
userDetails(): any {
  const token = localStorage.getItem('myToken');
  if (!token) {
    console.warn('Aucun token dans localStorage');
    return null;
  }
  try {
    const decoded = this.jwtHelper.decodeToken(token);
    // ✅ FIX : le JWT encapsule les données dans une clé 'data'
    const user = decoded?.data || decoded;
    console.log('User extrait :', user);
    return user;
  } catch (e) {
    console.error('Erreur décodage token', e);
    return null;
  }
}
isLoggedIn(){

    let token = localStorage.getItem("myToken");

    if (token) {
      return true ;
    } else {
      return false;
    }
  }

// ──────────────────────────────────────────────
// READ ALL - Récupérer tous les éléments
// ──────────────────────────────────────────────
getAll<T>(endpoint: string): Observable<T[]> {
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  return this.http.get<T[]>(`${this.apiUrl}/${cleanEndpoint}`, this.httpOptions)
    .pipe(
      catchError(this.handleError)
    );
}
// ──────────────────────────────────────────────
// PATCH - Mise à jour partielle (ex: statut)
// ──────────────────────────────────────────────
patch<T>(endpoint: string, id: number | string, item: Partial<T>): Observable<T> {
  return this.http.patch<T>(`${this.apiUrl}/${endpoint}/${id}`, item, this.httpOptions)
    .pipe(
      catchError(this.handleError)
    );
}

createPostulation(offreId: number, formData: FormData): Observable<any> {
  return this.http.post(
    `${this.apiUrl}/postulation/${offreId}`,
    formData
    // Do NOT set Content-Type manually — browser adds the correct boundary
  );
}
// ==================== GET LIST ====================
getPostulations(): Observable<Postulation[]> {
  return this.http.get<Postulation[]>(`${this.apiUrl}/postulation`);
}

// ==================== GET BY ID ====================
getPostulationById(id: number): Observable<Postulation> {
  return this.http.get<Postulation>(`${this.apiUrl}/postulation/${id}`);
}

// ==================== UPDATE ====================
updatePostulation(id: number, formData: FormData): Observable<Postulation> {
  return this.http.put<Postulation>(
    `${this.apiUrl}/postulation/${id}`,
    formData
  );
}

// ==================== DELETE ====================
deletePostulation(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/postulation/${id}`);
}
// Candidatures d'une entreprise
getCandidaturesByEntreprise(entrepriseId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/postulation/entreprise/${entrepriseId}`)
    .pipe(catchError(this.handleError));
}

// Changer statut candidature
changerStatutCandidature(id: number, statut: string): Observable<any> {
  return this.http.put<any>(
    `${this.apiUrl}/postulation/${id}/statut?statut=${statut}`, {}
  ).pipe(catchError(this.handleError));
}
forgotPassword(email: string, role: string = 'etudiant'): Observable<any> {
  return this.http.post<any>(
    `${this.apiUrl}/${role.toLowerCase()}/forgotpassword`,
    { email }
  ).pipe(catchError(this.handleError));
}

resetPassword(token: string, newPassword: string, role: string = 'etudiant'): Observable<any> {
  const roleEndpointMap: { [key: string]: string } = {
    'etudiant': 'etudiant',
    'entreprise': 'entreprise',
    'institution': 'institution',
    'candidat': 'candidat'
  };

  const endpoint = roleEndpointMap[role.toLowerCase()];

  if (!endpoint) {
    return throwError(() => new Error(`Rôle inconnu : ${role}`));
  }

  return this.http.post<any>(
    `${this.apiUrl}/${endpoint}/resetpassword`,
    { token, newPassword }
  ).pipe(catchError(this.handleError));
}
getRecommandations(role: string, id: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.apiUrl}/recommandation/${role.toLowerCase()}/${id}`
  ).pipe(catchError(this.handleError));
}
getFeedbacksOffre(offreId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/postulation/offre/${offreId}/feedbacks`)
    .pipe(catchError(this.handleError));
}
getCompteursCandidatures(): Observable<{[offreId: number]: number}> {
  return this.http.get<{[offreId: number]: number}>(
    `${this.apiUrl}/postulation/compteurs`
  ).pipe(catchError(this.handleError));
}
sendOtp(email: string): Observable<any> {
  const role = this.userDetails()?.role?.toLowerCase() || 'etudiant';
  return this.http.post<any>(`${this.apiUrl}/${role}/send-otp`, { email })
    .pipe(catchError(this.handleError));
}

changePassword(email: string, otp: string, newPassword: string): Observable<any> {
  const role = this.userDetails()?.role?.toLowerCase() || 'etudiant';
  return this.http.post<any>(`${this.apiUrl}/${role}/change-password`, {
    email, otp, newPassword
  }).pipe(catchError(this.handleError));
}
ameliorerTexte(texte: string, contexte: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/ia/ameliorer`, {
    texte,
    contexte
  }).pipe(catchError(this.handleError));
}
analyserCV(cvFilename: string, descriptionOffre: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/ia/analyser-cv`, {
    cv: cvFilename,
    descriptionOffre: descriptionOffre
  }).pipe(catchError(this.handleError));
}
}
