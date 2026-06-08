import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Offre } from '../Entites/Offre.Entites';  

export interface OffreSearchParams { // ymathel filtre mta search 
  query?: string; // el kelma li bech tsearchi biha
  location?: string; 
  type?: 'stage' | 'emploi' | 'pfe'  | 'internship' | string;
  secteur?: string[];
  page?: number;
  size?: number;
  sort?: 'date' | 'relevance' | 'popularity';
}
// Ajouter cette interface en haut du fichier, après les imports
export interface CategorieSecteur {
  secteur: string;
  icone: string;
  couleur: string;
  total: number;
  stages: number;
  pfe: number;
  emploi: number;
}

// Map statique des secteurs avec icônes et couleurs
const SECTEURS_CONFIG: Record<string, { icone: string; couleur: string }> = {
  'IT / Développement':       { icone: 'uil uil-desktop', couleur: 'violet' },
  'Marketing & Com.':         { icone: 'uil uil-megaphone', couleur: 'amber' },
  'Finance & Comptabilité':   { icone: 'uil uil-chart-line', couleur: 'green' },
  'Design & Créatif':         { icone: 'uil uil-brush-alt', couleur: 'pink' },
  'Ressources Humaines':      { icone: 'uil uil-users-alt', couleur: 'teal' },
  'Commercial & Ventes':      { icone: 'uil uil-shopping-cart', couleur: 'coral' },
  'Génie Civil & BTP':        { icone: 'uil uil-building', couleur: 'blue' },
  'Data & IA':                { icone: 'uil uil-robot', couleur: 'purple' },
  'Juridique':                { icone: 'uil uil-balance-scale', couleur: 'gray' },
  'Santé & Pharma':           { icone: 'uil uil-medical-square', couleur: 'teal' },
  'Enseignement':             { icone: 'uil uil-book-open', couleur: 'amber' },
  'Logistique & Supply':      { icone: 'uil uil-box', couleur: 'blue' },
};
export interface OffrePage { //pagination mta search
  content: Offre[];
  totalElements: number;
  number: number;           // numéro de page (souvent 0-based)
  size: number;
  totalPages?: number;
}

@Injectable({
  providedIn: 'root'
})
export class OffreService {
  deleteOffre(id: number) {
  return this.http.delete(`${this.apiUrl}/offres/${id}`);
}

  private apiUrl = 'http://localhost:8081/api';  // → à déplacer dans environment.ts !

  constructor(private http: HttpClient) {}

  
 getOffresParRole(role: 'ETUDIANT' | 'CANDIDAT'): Observable<Offre[]> {
  return this.http.get<Offre[]>(`${this.apiUrl}/offres/role/${role}`).pipe(
    map(offres => offres.map(o => this.fixImage(o))),// el map bch todhhor l image mtaa l offre
    catchError(this.handleError)
  );
} //yraj3lek les offres selon le role mta3ek (etudiant ou candidat)

  // Recherche + filtres + pagination
searchOffres(filters: any): Observable<any> {
  let params = new HttpParams();
  if (filters.query)        params = params.set('query',        filters.query);
  if (filters.type)         params = params.set('type',         filters.type);
  if (filters.localisation) params = params.set('localisation', filters.localisation);
  if (filters.secteur)      params = params.set('secteur',      filters.secteur);

  return this.http.get<any[]>(`${this.apiUrl}/offres/search`, { params }).pipe(
    map(offres => offres.map(o => this.fixImage(o))),
    catchError(this.handleError)
  );
}

  // Postuler à une offre
  postuler(offreId: number, etudiantId: number, motivation?: string): Observable<any> {
    const body = motivation
      ? { offreId, etudiantId, motivationLetter: motivation }
      : { offreId, etudiantId };

    return this.http.post(`${this.apiUrl}/candidature`, body)
      .pipe(catchError(this.handleError));
  }

  // Recommandations personnalisées
  getRecommendations(etudiantId: number): Observable<Offre[]> {
    return this.http.get<Offre[]>(`${this.apiUrl}/offres/recommendations/${etudiantId}`)
      .pipe(catchError(this.handleError));
  }

  // offre.service.ts — déjà correct, mais vérifier que l'URL correspond
getOffreById(id: number): Observable<Offre> {
  return this.http.get<Offre>(`${this.apiUrl}/offres/${id}`).pipe(
    map(o => this.fixImage(o)),
    catchError(this.handleError)
  );
}
  // Ajouter / retirer favori
  toggleFavori(offreId: number, save: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/offres/${offreId}/favori`, { save })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    let message = 'Une erreur est survenue';

    if (error.status === 0) {
      message = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    } else if (error.status === 401) {
      message = 'Session expirée. Veuillez vous reconnecter.';
    } else if (error.status === 403) {
      message = 'Accès non autorisé.';
    } else if (error.error?.message) {
      message = error.error.message;
    } else if (error.message) {
      message = error.message;
    }

    console.error('[OffreService]', error);
    return throwError(() => new Error(message));
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
getOffresByEntreprise(entrepriseId: number): Observable<Offre[]> {
  return this.http.get<Offre[]>(`${this.apiUrl}/offres/entreprise/${entrepriseId}`).pipe(
    map(offres => offres.map(o => this.fixImage(o)))
  );
}
getAllOffres(): Observable<Offre[]> {
  return this.http.get<Offre[]>(`${this.apiUrl}/offres`).pipe(
    map(offres => offres.map(o => this.fixImage(o))),
    catchError(this.handleError)
  );
}
getCategories(): Observable<{ type: string; nombreOffres: number }[]> {
  return this.http.get<{ type: string; nombreOffres: number }[]>(`${this.apiUrl}/offres/categories`);
}
getCategoriesSecteur(): Observable<CategorieSecteur[]> {
  return this.getAllOffres().pipe(
    map(offres => {
      // Grouper par secteur
      const map = new Map<string, { stages: number; pfe: number; emploi: number }>();

      offres.forEach(o => {
        const secteur = o.secteur?.trim() || 'Autre';
        if (!map.has(secteur)) map.set(secteur, { stages: 0, pfe: 0, emploi: 0 });
        const entry = map.get(secteur)!;
        const type = (o.type || '').toLowerCase();
        if (type === 'stage')       entry.stages++;
        else if (type === 'pfe')    entry.pfe++;
        else if (type === 'emploi') entry.emploi++;
      });

      return Array.from(map.entries()).map(([secteur, counts]) => ({
        secteur,
        icone: SECTEURS_CONFIG[secteur]?.icone ?? 'uil uil-briefcase-alt',
        couleur: SECTEURS_CONFIG[secteur]?.couleur ?? 'violet',
        total: counts.stages + counts.pfe + counts.emploi,
        ...counts
      })).sort((a, b) => b.total - a.total); // les plus actifs en premier
    }),
    catchError(this.handleError)
  );
}
getCandidaturesByOffre(offreId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `http://localhost:8081/api/postulation/offres/${offreId}`
  ).pipe(catchError(this.handleError));
}
// ─── Helper image ──────────────────────────────────────────
// On garde le nom de fichier brut dans imageNom, et on construit l'URL absolue
// pointant vers le backend Spring (port 8081) qui sert les fichiers statiques,
// ou vers le dossier Angular si les images sont copiées dans assets/.
private fixImage(offre: any): any {
  if (!offre.image) return { ...offre, image: null };

  // Si l'image est déjà une URL complète (commence par http), on la laisse telle quelle
  if (offre.image.startsWith('http')) return offre;

  // Sinon on construit le chemin vers assets Angular (les images uploadées
  // sont copiées dans E:/PFE/frond/src/assets/images/uploads/ par le backend)
  return {
    ...offre,
    image: `assets/images/uploads/${offre.image}`
  };
}
getOffresParEtudiant(etudiantId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/offres/etudiant/${etudiantId}`).pipe(
    map(offres => offres.map(o => this.fixImage(o))),
    catchError(this.handleError)
  );
}

getOffresParCandidat(candidatId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/offres/candidat/${candidatId}`).pipe(
    map(offres => offres.map(o => this.fixImage(o))),
    catchError(this.handleError)
  );
}


// Mettre à jour une offre (PUT avec FormData)
updateOffre(id: number, formData: FormData): Observable<any> {
  // ✅ Ne pas setter Content-Type manuellement, Angular le gère avec FormData
  return this.http.put<any>(`${this.apiUrl}/offres/${id}`, formData);
}
}