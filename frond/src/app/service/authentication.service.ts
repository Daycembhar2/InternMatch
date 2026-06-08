import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private jwtHelper = new JwtHelperService();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private userNameSubject   = new BehaviorSubject<string>('');
  private profilePicSubject = new BehaviorSubject<string>('assets/images/user/default-avatar.png');
  private userRoleSubject   = new BehaviorSubject<string>('');

  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  public userName$   = this.userNameSubject.asObservable();
  public profilePic$ = this.profilePicSubject.asObservable();
  public userRole$   = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient) {
    // Au démarrage, lire directement le token JWT
    this.loadFromToken();
  }

  private loadFromToken(): void {
    const token = localStorage.getItem('myToken');
    if (!token) {
      this.clearSubjects();
      return;
    }

    try {
      const decoded = this.jwtHelper.decodeToken(token);
      const user = decoded?.data || decoded;
      console.log('Token décodé :', user); // debug
      this.updateSubjects(user);
    } catch (e) {
      console.error('Token invalide', e);
      this.clearSubjects();
    }
  }

  private updateSubjects(user: any): void {
    if (!user) {
      this.clearSubjects();
      return;
    }

    this.isLoggedInSubject.next(true);

    // ✅ Rôle
    const role = (user?.role || '').toUpperCase().trim();
    this.userRoleSubject.next(role);

    // ✅ Nom affiché selon le rôle
    let displayName = '';

    if (role === 'ENTREPRISE') {
      // Pour une entreprise → nomEntreprise en priorité
      displayName = user?.nomEntreprise || user?.nom || 'Entreprise';
    } else {
      // Pour étudiant / candidat / institution → prénom + nom
      const prenom = (user?.prenom || '').trim();
      const nom    = (user?.nom    || '').trim();
      displayName  = [prenom, nom].filter(Boolean).join(' ');

      if (!displayName) {
        displayName = user?.email?.split('@')[0] || 'Utilisateur';
      }
    }

    this.userNameSubject.next(displayName);

    // ✅ Photo de profil
    this.profilePicSubject.next(
      user?.profilePic ||
      user?.photo      ||
      user?.avatar     ||
      'assets/images/user/default-avatar.png'
    );
  }

  /** Appelé après un login réussi — passer la réponse brute du backend */
  login(response: any): void {
    // Sauvegarder le token
    const token = response?.token || response?.access_token || response;
    if (token && typeof token === 'string') {
      localStorage.setItem('myToken', token);
    }
    this.loadFromToken();
  }

  logout(): void {
    localStorage.removeItem('myToken');
  localStorage.removeItem('myToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('selectedPlan'); 
  this.clearSubjects();
}
  

  private clearSubjects(): void {
    this.isLoggedInSubject.next(false);
    this.userNameSubject.next('');
    this.profilePicSubject.next('assets/images/user/default-avatar.png');
    this.userRoleSubject.next('');
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }
}