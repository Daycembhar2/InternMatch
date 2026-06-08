import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { CRUDService } from '../service/crud.service';

@Component({
  selector: 'app-institutionhome',
  templateUrl: './institutionhome.component.html',
  styleUrls: ['./institutionhome.component.css']
})
export class InstitutionhomeComponent {




  // ── URL de base ──────────────────────────────────────────────
  private baseUrl = 'http://localhost:8081/api';

  // ── Navigation ───────────────────────────────────────────────
  currentView: 'dashboard' | 'etudiants' | 'candidatures' | 'suivi' | 'encadrants' = 'dashboard';

  // ── Données ───────────────────────────────────────────────────
  institutionId!: number;
  etudiants: any[] = [];
  candidatures: any[] = [];

  // ── Stats dashboard ──────────────────────────────────────────
  totalEtudiants = 0;
  totalEnAttente = 0;
  totalAcceptes  = 0;

  // ── Filtres ───────────────────────────────────────────────────
  candidatureFilter = 'all';
  searchEtudiant    = '';

  // ── États UI ──────────────────────────────────────────────────
  loading        = false;
  successMessage = '';
  errorMessage   = '';

  // ── Modal refus ───────────────────────────────────────────────
  showRefusModal      = false;
  motifRefus          = '';
  candidatureIdRefus: number | null = null;

  constructor(private http: HttpClient , private crudService : CRUDService) {}

  // ────────────────────────────────────────────────────────────
  // INIT
  // ────────────────────────────────────────────────────────────
ngOnInit(): void {
  const token = localStorage.getItem('myToken');
  if (!token) return;

  const user = this.crudService.userDetails();
  console.log('User institution connecté:', user);
this.institutionId = user?.id;
  

  this.loadEtudiants();
  this.loadCandidatures();
}

  // ── Headers avec token ────────────────────────────────────────
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('myToken') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ────────────────────────────────────────────────────────────
  // CHARGEMENT DES DONNÉES
  // ────────────────────────────────────────────────────────────

  loadEtudiants(): void {
    this.loading = true;
    this.http.get<any[]>(
      `${this.baseUrl}/institution/${this.institutionId}/etudiants`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.etudiants      = data;
        this.totalEtudiants = data.length;
        this.loading        = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadCandidatures(): void {
    this.loading = true;
    this.http.get<any[]>(
      `${this.baseUrl}/institution/${this.institutionId}/candidatures`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.candidatures  = data;
        // Calcul stats dashboard
        this.totalEnAttente = data.filter(c =>
          c.statut?.toUpperCase() === 'EN_ATTENTE').length;
        this.totalAcceptes  = data.filter(c =>
          c.statut?.toUpperCase() === 'ACCEPTE').length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ────────────────────────────────────────────────────────────
  // NAVIGATION
  // ────────────────────────────────────────────────────────────

  goToDashboard():   void { this.currentView = 'dashboard';    this.clearMessages(); }
  goToEtudiants():   void { this.currentView = 'etudiants';    this.clearMessages(); }
  goToCandidatures():void { this.currentView = 'candidatures'; this.clearMessages(); }
  goToSuivi():       void { this.currentView = 'suivi';        this.clearMessages(); }

  // ────────────────────────────────────────────────────────────
  // FILTRES
  // ────────────────────────────────────────────────────────────

  // Filtre candidatures par statut
  get filteredCandidatures(): any[] {
    if (this.candidatureFilter === 'all') return this.candidatures;
    return this.candidatures.filter(c =>
      c.statut?.toUpperCase() === this.candidatureFilter
    );
  }

  // Filtre étudiants par nom/prénom
  get filteredEtudiants(): any[] {
    const search = this.searchEtudiant.toLowerCase().trim();
    if (!search) return this.etudiants;
    return this.etudiants.filter(e =>
      (e.nom?.toLowerCase().includes(search)) ||
      (e.prenom?.toLowerCase().includes(search)) ||
      (e.email?.toLowerCase().includes(search))
    );
  }

  changeCandidatureFilter(filter: string): void {
    this.candidatureFilter = filter;
  }

  // Candidatures d'un étudiant spécifique (vue suivi)
  getCandidaturesEtudiant(etudiantId: number): any[] {
    return this.candidatures.filter(c => c.etudiant?.id === etudiantId);
  }

  // ────────────────────────────────────────────────────────────
  // ACCEPTER UNE CANDIDATURE
  // ────────────────────────────────────────────────────────────

  accepterCandidature(candidatureId: number): void {
    this.clearMessages();
    this.http.put<any>(
      `${this.baseUrl}/institution/candidature/${candidatureId}/accepter`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.successMessage = 'Stage accepté ! Un email avec la lettre d\'affectation a été envoyé à l\'étudiant.';
        // Mettre à jour localement sans recharger toute la page
        const c = this.candidatures.find(x => x.id === candidatureId);
        if (c) c.statut = 'ACCEPTE';
        // Recalculer stats
        this.totalEnAttente = this.candidatures.filter(x =>
          x.statut?.toUpperCase() === 'EN_ATTENTE').length;
        this.totalAcceptes = this.candidatures.filter(x =>
          x.statut?.toUpperCase() === 'ACCEPTE').length;
        this.scrollTop();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de l\'acceptation : ' + (err.error?.message ?? 'Veuillez réessayer.');
        this.scrollTop();
      }
    });
  }

  // ────────────────────────────────────────────────────────────
  // REFUSER UNE CANDIDATURE — Modal
  // ────────────────────────────────────────────────────────────

  openRefusModal(candidatureId: number): void {
    this.candidatureIdRefus = candidatureId;
    this.motifRefus         = '';
    this.showRefusModal     = true;
  }

  closeRefusModal(): void {
    this.showRefusModal     = false;
    this.motifRefus         = '';
    this.candidatureIdRefus = null;
  }

  confirmerRefus(): void {
    if (!this.motifRefus.trim() || !this.candidatureIdRefus) return;

    this.http.put<any>(
      `${this.baseUrl}/institution/candidature/${this.candidatureIdRefus}/refuser`,
      { motif: this.motifRefus },
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.successMessage = 'Candidature refusée. Un email a été envoyé à l\'étudiant avec le motif.';
        // Mettre à jour localement
        const c = this.candidatures.find(x => x.id === this.candidatureIdRefus);
        if (c) {
          c.statut     = 'REFUSE';
          c.motifRefus = this.motifRefus;
        }
        // Recalculer stats
        this.totalEnAttente = this.candidatures.filter(x =>
          x.statut?.toUpperCase() === 'EN_ATTENTE').length;
        this.closeRefusModal();
        this.scrollTop();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du refus : ' + (err.error?.message ?? 'Veuillez réessayer.');
        this.closeRefusModal();
        this.scrollTop();
      }
    });
  }

  // ────────────────────────────────────────────────────────────
  // HELPERS
  // ────────────────────────────────────────────────────────────

  // Classe CSS selon statut
  getStatutClass(statut: string): string {
    switch (statut?.toUpperCase()) {
      case 'ACCEPTE':   return 'bg-green-100 text-green-700';
      case 'REFUSE':    return 'bg-red-100 text-red-700';
      case 'EN_ATTENTE':return 'bg-yellow-100 text-yellow-700';
      default:          return 'bg-gray-100 text-gray-500';
    }
  }

  // Label lisible selon statut
  getStatutLabel(statut: string): string {
    switch (statut?.toUpperCase()) {
      case 'ACCEPTE':   return '✅ Accepté';
      case 'REFUSE':    return '❌ Refusé';
      case 'EN_ATTENTE':return '⏳ En attente';
      default:          return statut ?? '—';
    }
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage   = '';
  }

  scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
encadrants: string[] = [];
nouvelEncadrant = '';

get etudiantsEnAttente(): any[] {
    return this.etudiants.filter(e => e.statutEncadrant === 'EN_ATTENTE');
}

goToEncadrants(): void { this.currentView = 'encadrants'; this.loadEncadrants(); }

loadEncadrants(): void {
    this.http.get<string[]>(
        `${this.baseUrl}/institution/${this.institutionId}/encadrants`,
        { headers: this.getHeaders() }
    ).subscribe({ next: (data) => this.encadrants = data });
}

ajouterEncadrant(): void {
    if (!this.nouvelEncadrant.trim()) return;
    this.http.post(`${this.baseUrl}/institution/${this.institutionId}/encadrants`,
        { encadrant: this.nouvelEncadrant }, { headers: this.getHeaders() })
    .subscribe({ next: () => { this.loadEncadrants(); this.nouvelEncadrant = ''; } });
}

supprimerEncadrant(enc: string): void {
    this.http.delete(`${this.baseUrl}/institution/${this.institutionId}/encadrants`,
        { headers: this.getHeaders(), body: { encadrant: enc } })
    .subscribe({ next: () => this.loadEncadrants() });
}

validerEncadrant(etudiantId: number, decision: string): void {
    this.http.put(`${this.baseUrl}/institution/etudiant/${etudiantId}/valider-encadrant`,
        { decision }, { headers: this.getHeaders() })
    .subscribe({ next: () => this.loadEtudiants() });
}

countEtudiants(enc: string): number {
    return this.etudiants.filter(e =>
        e.encadrantChoisi === enc && e.statutEncadrant === 'ACCEPTE').length;
}
}