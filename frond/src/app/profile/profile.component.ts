import { Component, OnInit } from '@angular/core';
import { CRUDService } from '../service/crud.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  utilisateur: any = null;
  role: string = '';
  activeTab: string = 'overview';
  loading: boolean = true;
  saving: boolean = false;
  saveSuccess: boolean = false;
  saveError: string = '';

  // Formulaire éditable
  formData: any = {};
  userId: number = 0;

  constructor(private crudService: CRUDService, private router: Router) {}

  ngOnInit(): void {
  const tokenData = this.crudService.userDetails();
  
  console.log('TOKEN DATA COMPLET :', tokenData); // vérifie dans la console

  if (!tokenData) { this.router.navigate(['/signin']); return; }

  this.role = (tokenData.role || '').toUpperCase().trim();
  
  // L'ID est dans tokenData.id (hérité de Utilisateur)
  this.userId = tokenData.id;

  if (!this.userId || !this.role) { 
    this.router.navigate(['/login']); 
    return; 
  }

  const endpointMap: Record<string, string> = {
    'ETUDIANT':    'etudiant',
    'CANDIDAT':    'candidat',
    'ENTREPRISE':  'entreprise',
    'INSTITUTION': 'institution'
  };

  const endpoint = endpointMap[this.role];
  if (!endpoint) return;

  this.crudService.getById<any>(endpoint, this.userId).subscribe({
    next: (data) => {
      console.log('DONNÉES ÉTUDIANT COMPLÈTES :', JSON.stringify(data));
      console.log('DATA APRÈS SAVE :', data);
      this.utilisateur = { ...data, role: this.role };
      this.initFormData();
      this.loading = false;
    },
    error: (err) => {
      console.error('Erreur chargement profil :', err);
      this.utilisateur = { ...tokenData, role: this.role };
      this.initFormData();
      this.loading = false;
    }
  });
}

  initFormData(): void {
    if (this.role === 'ETUDIANT') {
      this.formData = {
        nom:        this.utilisateur?.nom        || '',
        prenom:     this.utilisateur?.prenom     || '',
        niveau:     this.utilisateur?.niveau     || '',
        specialite: this.utilisateur?.specialite || '',
        faculte:    this.utilisateur?.faculte    || '',
        telephone:  this.utilisateur?.telephone  || ''
      };
   } else if (this.role === 'CANDIDAT') {
    this.formData = {
        nom:              this.utilisateur?.nom              || '',
        prenom:           this.utilisateur?.prenom           || '',
        competences:      this.utilisateur?.competences      || '',
        secteur: this.utilisateur?.secteur || '' ,
         telephone:        this.utilisateur?.telephone        || '' // ✅
    };
    } else if (this.role === 'ENTREPRISE') {
      this.formData = {
        nomEntreprise: this.utilisateur?.nomEntreprise || '',
        secteur:       this.utilisateur?.secteur       || '',
         telephone:        this.utilisateur?.telephone        || ''
      };
    }
    // Charger les encadrants dès que le profil étudiant est chargé
if (this.role === 'ETUDIANT') {
  this.loadEncadrants();
}
  }
goToHome(): void {
  switch (this.role) {
    case 'ETUDIANT':    this.router.navigate(['/etudiant/home']);    break;
    case 'CANDIDAT':    this.router.navigate(['/candidat/home']);    break;
    case 'ENTREPRISE':  this.router.navigate(['/entreprise/home']);  break;
    case 'INSTITUTION': this.router.navigate(['/institution/home']); break;
    default:            this.router.navigate(['/']);
  }
}
  sauvegarderProfil(): void {
  this.saving = true;
  this.saveSuccess = false;
  this.saveError = '';

  const endpointMap: Record<string, string> = {
    'ETUDIANT':    'etudiant',
    'CANDIDAT':    'candidat',
    'ENTREPRISE':  'entreprise',
    'INSTITUTION': 'institution'
  };

  const endpoint = endpointMap[this.role];
  if (!endpoint) return;

  this.crudService.update<any>(endpoint, this.userId, this.formData).subscribe({
    next: () => {
      // ← Recharger depuis la base plutôt que d'utiliser la réponse partielle
      this.crudService.getById<any>(endpoint, this.userId).subscribe({
        next: (data) => {
          this.utilisateur = { ...data, role: this.role };
          this.initFormData();
          this.saving = false;
          this.saveSuccess = true;
          setTimeout(() => this.saveSuccess = false, 3000);
        }
      });
    },
    error: (err) => {
      this.saving = false;
      this.saveError = 'Erreur lors de la sauvegarde. Réessayez.';
      console.error(err);
    }
  });
}

  setTab(tab: string): void { this.activeTab = tab; }

  get initiales(): string {
    const p = this.utilisateur?.prenom?.[0] || '';
    const n = this.utilisateur?.nom?.[0]    || '';
    return (p + n).toUpperCase();
  }

  get nomAffiche(): string {
    if (this.role === 'ENTREPRISE')  return this.utilisateur?.nomEntreprise || this.utilisateur?.nom || '';
    if (this.role === 'INSTITUTION') return this.utilisateur?.nomFaculte    || this.utilisateur?.nom || '';
    return `${this.utilisateur?.prenom || ''} ${this.utilisateur?.nom || ''}`.trim();
  }

  get soustitre(): string {
    if (this.role === 'ETUDIANT')    return this.utilisateur?.specialite || 'Étudiant';
    if (this.role === 'CANDIDAT')    return 'Candidat';
    if (this.role === 'ENTREPRISE')  return this.utilisateur?.secteur    || 'Entreprise';
    if (this.role === 'INSTITUTION') return 'Institution';
    return '';
  }

  get competencesList(): string[] {
    if (!this.utilisateur?.competences) return [];
    return this.utilisateur.competences.split(',').map((c: string) => c.trim()).filter(Boolean);
  }
  // ── Changement de mot de passe ────────────────
showPasswordSection = false;
otpSent      = false;
otpVerified  = false;
sendingOtp   = false;
changingPwd  = false;
otpInput     = '';
newPassword  = '';
confirmPassword = '';
pwdMessage   = '';
pwdError     = '';
otpCooldown  = 0;
private cooldownTimer: any;

togglePasswordSection(): void {
  this.showPasswordSection = !this.showPasswordSection;
  // Reset
  this.otpSent = false;
  this.otpInput = '';
  this.newPassword = '';
  this.confirmPassword = '';
  this.pwdMessage = '';
  this.pwdError = '';
}

sendOtp(): void {
  if (!this.utilisateur?.email) return;
  this.sendingOtp = true;
  this.pwdError = '';
  this.pwdMessage = '';

  this.crudService.sendOtp(this.utilisateur.email).subscribe({
    next: () => {
      this.otpSent = true;
      this.sendingOtp = false;
      this.pwdMessage = `Code envoyé à ${this.utilisateur.email}`;
      // Cooldown 60s pour éviter le spam
      this.otpCooldown = 60;
      this.cooldownTimer = setInterval(() => {
        this.otpCooldown--;
        if (this.otpCooldown <= 0) clearInterval(this.cooldownTimer);
      }, 1000);
    },
    error: (err) => {
      this.sendingOtp = false;
      this.pwdError = err.message || 'Erreur lors de l\'envoi du code';
    }
  });
}

changePassword(): void {
  this.pwdError = '';
  if (!this.otpInput || this.otpInput.length !== 6) {
    this.pwdError = 'Entrez le code à 6 chiffres reçu par email'; return;
  }
  if (!this.newPassword || this.newPassword.length < 6) {
    this.pwdError = 'Le mot de passe doit contenir au moins 6 caractères'; return;
  }
  if (this.newPassword !== this.confirmPassword) {
    this.pwdError = 'Les mots de passe ne correspondent pas'; return;
  }

  this.changingPwd = true;
  this.crudService.changePassword(
    this.utilisateur.email, this.otpInput, this.newPassword
  ).subscribe({
    next: () => {
      this.changingPwd = false;
      this.pwdMessage = '✅ Mot de passe modifié avec succès !';
      this.otpSent = false;
      this.otpInput = '';
      this.newPassword = '';
      this.confirmPassword = '';
      setTimeout(() => this.showPasswordSection = false, 2000);
    },
    error: (err) => {
      this.changingPwd = false;
      this.pwdError = err.message || 'Code incorrect ou expiré';
    }
  });
}
// ── Encadrant (ETUDIANT uniquement) ──────────────────────────
encadrantsDisponibles: string[] = [];
encadrantSelectionne: string = '';
choisissantEncadrant = false;
encadrantMessage = '';
encadrantError = '';

loadEncadrants(): void {
  // ✅ Lire institutionId directement (plus institution?.id)
  const instId = this.utilisateur?.institutionId 
              || this.utilisateur?.institution?.id;

  if (!instId) {
    this.encadrantError = "Aucune institution liée à votre compte.";
    return;
  }

  this.crudService.getAll<string>(`institution/${instId}/encadrants`)
    .subscribe({
      next: (data) => {
        this.encadrantsDisponibles = data;
        this.encadrantSelectionne = this.utilisateur?.encadrantChoisi || '';
        this.encadrantError = ''; // ✅ effacer l'erreur si succès
      },
      error: () => this.encadrantError = "Impossible de charger les encadrants."
    });
}

choisirEncadrant(): void {
  if (!this.encadrantSelectionne) return;
  this.choisissantEncadrant = true;
  this.encadrantMessage = '';
  this.encadrantError = '';

  // ✅ URL correcte sans /0 parasite
  const url = `http://localhost:8081/api/institution/etudiant/${this.userId}/choisir-encadrant`;

  this.crudService.http.put<any>(url, { encadrant: this.encadrantSelectionne })
    .subscribe({
      next: () => {
        this.choisissantEncadrant = false;
        this.encadrantMessage = "Demande envoyée ! L'institution validera votre choix.";
        this.utilisateur.encadrantChoisi = this.encadrantSelectionne;
        this.utilisateur.statutEncadrant = 'EN_ATTENTE';
      },
      error: (err) => {
        this.choisissantEncadrant = false;
        this.encadrantError = err.error?.message || "Erreur lors du choix.";
      }
    });
}
}