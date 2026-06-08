import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Admin } from '../Entites/Admin.Entites';
import { Etudiant } from '../Entites/Etudiant.Entites';
import { Institution } from '../Entites/Institution.Entites';
import { Entreprise } from '../Entites/Entreprise.Entites';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Candidat } from '../Entites/Candidat.Entites';
import { Contact } from '../Entites/Contact.Entites';
import { Offre } from '../Entites/Offre.Entites';

@Injectable({
  providedIn: 'root'
})
export class CRUDService {

  private apiUrl = 'http://localhost:8081/api';  // sans /api pour plus de flexibilité

  // BehaviorSubject pour les admins (utile pour le dashboard par exemple) méthode pour toujourss les informations mettre a jour
  private adminsSubject = new BehaviorSubject<Admin[]>([]);
  admins$ = this.adminsSubject.asObservable();

  private etudiantsSubject = new BehaviorSubject<Etudiant[]>([]);
  etudiants$ = this.etudiantsSubject.asObservable();
  private candidatsSubject = new BehaviorSubject<Candidat[]>([]);
candidats$ = this.candidatsSubject.asObservable();
  private contactsSubject = new BehaviorSubject<Contact[]>([]);
  contacts$ = this.contactsSubject.asObservable();
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) { }

  // ────────────────────────────────────────────────
  //                  Authentification
  // ────────────────────────────────────────────────
  loginAdmin(admin: { email: string; mdp: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/login`, admin);
  }

  

  isLoggedIn(): boolean {
    return !!localStorage.getItem('myToken');
  }

 getUserDetails(): any {
  const token = localStorage.getItem('myToken');
  if (!token) {
    console.warn('Aucun token dans localStorage');
    return null;
  }

  try {
    const decoded = this.jwtHelper.decodeToken(token);
    console.log('=== TOKEN DÉCODÉ COMPLET ===');
    console.log(decoded);                     // ← montre TOUT
    console.log('Clés disponibles :', Object.keys(decoded));
    console.log('Nom présent ?', !!decoded.nom, decoded.nom);
    console.log('Prénom présent ?', !!decoded.prenom, decoded.prenom);
    return decoded;
  } catch (e) {
    console.error('Erreur décodage token', e);
    return null;
  }
}

  // ────────────────────────────────────────────────
  //                  ADMIN
  // ────────────────────────────────────────────────
  addAdmin(admin: Admin): Observable<Admin> {
    return this.http.post<Admin>(`${this.apiUrl}/admin`, admin).pipe(
      tap(newAdmin => {
        const current = this.adminsSubject.value;
        this.adminsSubject.next([...current, newAdmin]);
      })
    );
  }

  getAllAdmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(`${this.apiUrl}/admin`).pipe(
      tap(admins => this.adminsSubject.next(admins)),
      catchError(err => {
        console.error('Erreur chargement admins', err);
        return throwError(() => err);
      })
    );
  }

  getAdminById(id: number): Observable<Admin> {
    return this.http.get<Admin>(`${this.apiUrl}/admin/${id}`);
  }

  updateAdmin(id: number, admin: Admin): Observable<Admin> {
    return this.http.put<Admin>(`${this.apiUrl}/admin/${id}`, admin);
  }

  deleteAdmin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/${id}`);
  }

  // ────────────────────────────────────────────────
  //                  ENTREPRISE
  // ────────────────────────────────────────────────
  addEntreprise(entreprise: Entreprise): Observable<Entreprise> {
    return this.http.post<Entreprise>(`${this.apiUrl}/entreprise`, entreprise);
  }

  getAllEntreprises(): Observable<Entreprise[]> {
    return this.http.get<Entreprise[]>(`${this.apiUrl}/entreprise`);
  }

  getEntrepriseById(id: number): Observable<Entreprise> {
    return this.http.get<Entreprise>(`${this.apiUrl}/entreprise/${id}`);
  }

  updateEntreprise(id: number, data: any) {
  return this.http.put(`${this.apiUrl}/entreprise/updateetat/${id}`, data);
}

  deleteEntreprise(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/entreprise/${id}`);
  }

  // ────────────────────────────────────────────────
  //                  ETUDIANT
  // ────────────────────────────────────────────────
  addEtudiant(etudiant: Etudiant): Observable<Etudiant> {
    return this.http.post<Etudiant>(`${this.apiUrl}/etudiant`, etudiant);
  }

  getAllEtudiants(): Observable<Etudiant[]> {
    return this.http.get<Etudiant[]>(`${this.apiUrl}/etudiant`).pipe(
      tap(etudiants => this.etudiantsSubject.next(etudiants))
    );
  }

  getEtudiantById(id: number): Observable<Etudiant> {
    return this.http.get<Etudiant>(`${this.apiUrl}/etudiant/${id}`);
  }

  updateEtudiant(id: number, etudiant: Etudiant): Observable<Etudiant> {
    return this.http.put<Etudiant>(`${this.apiUrl}/etudiant/${id}`, etudiant);
  }

  deleteEtudiant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/etudiant/${id}`);
  }

  // ────────────────────────────────────────────────
  //                  INSTITUTION
  // ────────────────────────────────────────────────
  addInstitution(institution: Institution): Observable<Institution> {
    return this.http.post<Institution>(`${this.apiUrl}/institution`, institution);
  }

  getAllInstitutions(): Observable<Institution[]> {
    return this.http.get<Institution[]>(`${this.apiUrl}/institution`);
  }

  getInstitutionById(id: number): Observable<Institution> {
    return this.http.get<Institution>(`${this.apiUrl}/institution/${id}`);
  }

  updateInstitution(id: number, institution: Institution): Observable<Institution> {
    return this.http.put<Institution>(`${this.apiUrl}/institution/${id}`, institution);
  }

  deleteInstitution(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/institution/${id}`);
  }

  // ────────────────────────────────────────────────
  //                  Méthodes utilitaires
  // ────────────────────────────────────────────────
  refreshAdmins(): void {
    this.getAllAdmins().subscribe(); // recharge et met à jour le BehaviorSubject
  }
  // Méthode pour forcer le refresh (appelable après ajout)
refreshEtudiants(): void {
  this.getAllEtudiants().subscribe();  // recharge et met à jour le subject
}
refreshCandidats(): void {
  this.getAllCandidats().subscribe();  // recharge et met à jour le subject
}

 addCandidat(candidat: Candidat): Observable<Candidat> {
    return this.http.post<Candidat>(`${this.apiUrl}/candidat`, candidat);
  }

  getAllCandidats(): Observable<Candidat[]> {
    return this.http.get<Candidat[]>(`${this.apiUrl}/candidat`).pipe(
      tap(candidats => this.candidatsSubject.next(candidats))
    );
  }

  getCandidatById(id: number): Observable<Candidat> {
    return this.http.get<Candidat>(`${this.apiUrl}/candidat/${id}`);
  }

  updateCandidat(id: number, candidat: Candidat): Observable<Candidat> {
    return this.http.put<Candidat>(`${this.apiUrl}/candidat/${id}`, candidat);
  }

  deleteCandidat(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/candidat/${id}`);
  }
  forgotPassword(email: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/admin/forgotpassword`, { email });
}
resetPassword(token: string, newPassword: string) {
  return this.http.post(`${this.apiUrl}/admin/resetpassword`, {
    token: token,
    password: newPassword
  });
}
register(data: { nom: string; email: string; mdp: string }): Observable<any> {
  return this.http.post(`${this.apiUrl}/register`, data);
}
 getAllContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}/contact`).pipe(
      tap(contacts => this.contactsSubject.next(contacts))
    );
  }
  
  deleteContact(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/contact/${id}`);
  }
  // ────────────────────────────────────────────────
//                  OFFRE
// ────────────────────────────────────────────────
getAllOffres(): Observable<Offre[]> {
  return this.http.get<Offre[]>(`${this.apiUrl}/offres`);
}

getOffreById(id: number): Observable<Offre> {
  return this.http.get<Offre>(`${this.apiUrl}/offres/${id}`);
}

addOffre(offre: Offre): Observable<Offre> {
  return this.http.post<Offre>(`${this.apiUrl}/offres`, offre);
}

updateOffre(id: number, offre: Offre): Observable<Offre> {
  return this.http.put<Offre>(`${this.apiUrl}/offres/${id}`, offre);
}

updateOffreEtat(id: number, data: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/offre/updateetat/${id}`, data);
}

deleteOffre(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/offres/${id}`);
}

}