import { Component, OnInit, OnDestroy } from '@angular/core';
import { OffreService } from '../service/offre.service';
import { Router, ActivatedRoute } from '@angular/router';   // ✅ Ajout ActivatedRoute
import { CRUDService } from '../service/crud.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-liste-offres',
  templateUrl: './liste-offres.component.html',
  styleUrls: ['./liste-offres.component.css']
})
export class ListeOffresComponent implements OnInit, OnDestroy {

  listOffres: any[] = [];
  isLoading = false;
  errorMessage = '';
  currentRole = '';
  entrepriseId: number | null = null;  // ← ID de l'entreprise connectée
  showLoginPrompt = false;
  Math = Math; // ✅ rendre Math accessible dans le template
  searchQuery          = '';
  selectedType         = '';
  activeTypeBtn        = '';            // ← bouton de type actif
  selectedLocalisation = '';
  selectedSecteur      = '';

  // ── Boutons de filtre selon le rôle ──────────────────────────
  // Institution / Étudiant → uniquement Stages
  // Candidat               → uniquement Emplois
  // Entreprise / anonyme   → Stages + Emplois
  get typesFiltresDisponibles(): { label: string; value: string }[] {
    if (this.currentRole === 'ETUDIANT' || this.currentRole === 'INSTITUTION') {
      return [{ label: '🎓 Stages', value: 'stage' }];
    }
    if (this.currentRole === 'CANDIDAT') {
      return [{ label: '💼 Emplois', value: 'emploi' }];
    }
    // Entreprise ou non connecté
    return [
      { label: '🎓 Stages',  value: 'stage'  },
      { label: '💼 Emplois', value: 'emploi' }
    ];
  }

  /** Appelé par un clic sur un bouton pill de type */
  filtrerParType(value: string): void {
    // Toggle : clic sur le bouton actif → désélectionner
    this.activeTypeBtn  = this.activeTypeBtn === value ? '' : value;
    this.selectedType   = this.activeTypeBtn;
    this.currentPage    = 1;
    if (this.selectedType || this.searchQuery || this.selectedLocalisation || this.selectedSecteur) {
      this.executeSearch();
    } else {
      this.chargerOffresSelonRole();
    }
  }

  private destroy$      = new Subject<void>();

  constructor(
    private offreService: OffreService,
    private crudService: CRUDService,
    public  router: Router,
    private route: ActivatedRoute   
  ) {}

 ngOnInit(): void {
  const user = this.crudService.userDetails();
  this.currentRole = (user?.role || '').toUpperCase().trim();
  if (this.currentRole === 'ENTREPRISE' && user?.id) {
    this.entrepriseId = user.id;
  }

  // ── Pré-sélectionner le type selon le rôle ──────────────────
  if (this.currentRole === 'ETUDIANT' || this.currentRole === 'INSTITUTION') {
    this.activeTypeBtn = 'stage';
    this.selectedType  = 'stage';
  } else if (this.currentRole === 'CANDIDAT') {
    this.activeTypeBtn = 'emploi';
    this.selectedType  = 'emploi';
  }

  this.loadCompteurs();

 

  this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
    this.searchQuery          = params['query']        || '';
    this.selectedLocalisation = params['localisation'] || '';
    this.selectedType         = params['type']         || '';
      this.selectedSecteur      = params['secteur']      || '';

    if (this.searchQuery || this.selectedLocalisation || 
      this.selectedType || this.selectedSecteur) {        
    this.executeSearch();
  } else {
    this.chargerOffresSelonRole();
  }
});
}
private textTimer: any = null;

onTextChange(): void {
  if (this.textTimer) clearTimeout(this.textTimer);
  this.textTimer = setTimeout(() => this.executeSearch(), 400);
}
 ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
  if (this.textTimer) clearTimeout(this.textTimer);
}
goToHome(): void {
  switch (this.currentRole) {
    case 'ETUDIANT':    this.router.navigate(['/etudiant/home']);    break;
    case 'CANDIDAT':    this.router.navigate(['/candidat/home']);    break;
    case 'ENTREPRISE':  this.router.navigate(['/entreprise/home']);  break;
    case 'INSTITUTION': this.router.navigate(['/institution/home']); break;
    default:            this.router.navigate(['/']);
  }
}
// Appelé à chaque changement de filtre (type, localisation, secteur)
  onFilterChange(): void {
  this.executeSearch();
}

 executeSearch(): void {
  this.isLoading = true;
  this.errorMessage = '';
  this.currentPage = 1;

  const hasFilters = this.searchQuery || this.selectedType ||
                     this.selectedLocalisation || this.selectedSecteur;

  // ✅ Ajouter le filtre de type selon le rôle si aucun type n'est sélectionné
  let typeFilter = this.selectedType;
  if (!typeFilter) {
    if (this.currentRole === 'ETUDIANT') typeFilter = 'STAGE'; // ← côté backend, les types sont en majuscules
    if (this.currentRole === 'CANDIDAT') typeFilter = 'EMPLOI';
  }

  if (hasFilters) {
    this.offreService.searchOffres({
      query:        this.searchQuery,
      type:         typeFilter,     // ← utiliser le type filtré par rôle
      localisation: this.selectedLocalisation,
      secteur:      this.selectedSecteur
    }).subscribe({
      next: (data) => { this.listOffres = data || []; this.isLoading = false; },
      error: () => { this.errorMessage = 'Erreur lors de la recherche.'; this.isLoading = false; }
    });
  } else {
    this.chargerOffresSelonRole();
  }
}
// Réinitialiser tous les filtres et revenir à la liste par défaut
  resetFiltres(): void {
    this.searchQuery          = '';
    this.selectedLocalisation = '';
    this.selectedSecteur      = '';

    // Remettre le filtre de type par défaut selon le rôle
    if (this.currentRole === 'ETUDIANT' || this.currentRole === 'INSTITUTION') {
      this.activeTypeBtn = 'stage';
      this.selectedType  = 'stage';
    } else if (this.currentRole === 'CANDIDAT') {
      this.activeTypeBtn = 'emploi';
      this.selectedType  = 'emploi';
    } else {
      this.activeTypeBtn = '';
      this.selectedType  = '';
    }

    this.router.navigate(['/listoffres']);
    this.chargerOffresSelonRole();
  }
// Charger les offres selon le rôle de l'utilisateur
 chargerOffresSelonRole(): void {
  const user = this.crudService.userDetails();
  this.isLoading = true;
  this.errorMessage = '';

  const load = (obs: any) => obs.subscribe({
    next: (data: any) => {
      this.listOffres = data || [];
      this.currentPage = 1;
      this.isLoading = false;
    },
    error: (err: any) => {
      console.error('Erreur chargement offres:', err);
      this.errorMessage = 'Impossible de charger les offres.';
      this.isLoading = false;
    }
  });

  if (!user || !user.id) {
    load(this.offreService.getAllOffres());
    return;
  }

  switch (this.currentRole) {
    //  Filtre par entreprise côté backend
    case 'ENTREPRISE':
      load(this.offreService.getOffresByEntreprise(user.id));
      break;
    case 'ETUDIANT':
      //  Filtre par secteur de l'étudiant côté backend
      load(this.offreService.getOffresParEtudiant(user.id));
      break;
    case 'CANDIDAT':
      //  Filtre par domaine du candidat côté backend
      load(this.offreService.getOffresParCandidat(user.id));
      break;
      // Non connecté → voit TOUTES les offres validée
    default:
      load(this.offreService.getAllOffres());
  }
}

  goToPostulation(offreId: number): void {
    if (!this.crudService.isLoggedIn()) {
      this.showLoginPrompt = true;
      return;
    }
    this.router.navigate(['/postulation', offreId]);
  }

  modifierOffre(offreId: number): void {
    this.router.navigate(['/entreprise/offreForm'], { queryParams: { id: offreId } });
  }

  voirDetails(offreId: number): void {
    this.router.navigate(['/offre', offreId]);
  }
  // Pagination
currentPage = 1;
pageSize = 8;

get offresPaginees(): any[] {
  const debut = (this.currentPage - 1) * this.pageSize;
  return this.listOffres.slice(debut, debut + this.pageSize);
}

get totalPages(): number {
  return Math.ceil(this.listOffres.length / this.pageSize);
}

get pages(): number[] {
  return Array.from({ length: this.totalPages }, (_, i) => i + 1);
}

changerPage(page: number): void {
  if (page < 1 || page > this.totalPages) return;
  this.currentPage = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
// Ajouter la variable
compteursMap: {[offreId: number]: number} = {};

// Appeler dans ngOnInit après chargerOffresSelonRole()
private loadCompteurs(): void {
  this.crudService.getCompteursCandidatures().subscribe({
    next: (data) => this.compteursMap = data,
    error: () => {}  // silencieux
  });
}
}