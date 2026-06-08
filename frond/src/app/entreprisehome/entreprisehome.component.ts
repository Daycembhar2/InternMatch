import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Offre } from '../Entites/Offre.Entites';
import { OffreService } from '../service/offre.service';
import { CRUDService } from '../service/crud.service';
import Swal from 'sweetalert2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-entreprisehome',
  templateUrl: './entreprisehome.component.html',
  styleUrls: ['./entreprisehome.component.css']
})
export class EntreprisehomeComponent implements OnInit, OnDestroy {

  currentView: 'dashboard' | 'candidatures' = 'dashboard';
  offres: Offre[] = [];
  candidatures: any[] = [];
  filteredCandidatures: any[] = [];
  selectedOffreId: number | null = null;
  candidatureFilter: string = 'all';
  loading = false;
  errorMessage = '';
  successMessage = '';
  entrepriseId!: number;
activePlan: any = null;
canPost = true;
remainingOffres = 0;
  private pieChart: Chart | null = null;
  private barChart: Chart | null = null;
// Ajoutez ces propriétés après "loading = false;"
analysisResults: { [key: number]: any } = {};
analyzingId: number | null = null;
  constructor(
    private offreService: OffreService,
    private crudService: CRUDService,
    private router: Router
  ) {}

ngOnInit(): void {
  const user = this.crudService.userDetails();
  this.entrepriseId = user?.id;

  // ✅ Clé unique par entreprise
  const planKey = `selectedPlan_${this.entrepriseId}`;
  const raw = localStorage.getItem(planKey);

  if (raw) {
    this.activePlan = JSON.parse(raw);
  } else {
    // Nouveau compte → plan gratuit par défaut
    this.activePlan = {
      name: 'Gratuit',
      maxOffres: 5,
      price: 0
    };
    localStorage.setItem(planKey, JSON.stringify(this.activePlan));
  }

  this.loadOffres();
  this.loadCandidatures();
}

goToUpgrade(): void {
  this.router.navigate(['/paiement']);
}
  ngOnDestroy(): void {
    if (this.pieChart) this.pieChart.destroy();
    if (this.barChart) this.barChart.destroy();
  }

 loadOffres(): void {
  this.offreService.getOffresByEntreprise(this.entrepriseId).subscribe({
    next: (data) => {
      this.offres = data;
      // Vérifier le quota après chargement
      const max = this.activePlan?.maxOffres ?? 5;
      this.canPost = max === -1 || this.offres.length < max;
      this.remainingOffres = max === -1 ? 9999 : Math.max(0, max - this.offres.length);
    },
    error: (err) => console.error('Erreur offres', err)
  });
}

  loadCandidatures(): void {
    this.loading = true;
    this.crudService.getCandidaturesByEntreprise(this.entrepriseId).subscribe({
      next: (data) => {
        this.candidatures = data;
        this.filterCandidatures();
        this.updateCharts();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur chargement candidatures';
        this.loading = false;
      }
    });
  }

  updateCharts(): void {
    const enAttente = this.candidatures.filter(c => c.statut?.toUpperCase() === 'EN_ATTENTE').length;
    const acceptees = this.candidatures.filter(c => c.statut?.toUpperCase() === 'ACCEPTE').length;
    const refusees  = this.candidatures.filter(c => c.statut?.toUpperCase() === 'REFUSE').length;

    if (this.pieChart) { this.pieChart.destroy(); this.pieChart = null; }
    if (this.barChart) { this.barChart.destroy(); this.barChart = null; }

    setTimeout(() => {
      // Camembert
      const pieCanvas = document.getElementById('pieChart') as HTMLCanvasElement;
      if (pieCanvas) {
        this.pieChart = new Chart(pieCanvas, {
          type: 'pie',
          data: {
            labels: ['En attente', 'Acceptées', 'Refusées'],
            datasets: [{
              data: [enAttente, acceptees, refusees],
              backgroundColor: ['#f59e0b', '#10b981', '#ef4444']
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
          }
        });
      }

      // Barres
      const grouped: { [titre: string]: number } = {};
      this.candidatures.forEach(c => {
        const titre = c.offre?.titre || 'Offre supprimée';
        const label = titre.length > 20 ? titre.substring(0, 20) + '...' : titre;
        grouped[label] = (grouped[label] || 0) + 1;
      });

      const barCanvas = document.getElementById('barChart') as HTMLCanvasElement;
      if (barCanvas) {
        this.barChart = new Chart(barCanvas, {
          type: 'bar',
          data: {
            labels: Object.keys(grouped),
            datasets: [{
              data: Object.values(grouped),
              label: 'Candidatures',
              backgroundColor: '#7c3aed',
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
          }
        });
      }
    }, 100);
  }

  filterCandidatures(): void {
    let result = [...this.candidatures];
    if (this.candidatureFilter !== 'all') {
      result = result.filter(c => c.statut === this.candidatureFilter);
    }
    if (this.selectedOffreId !== null) {
      result = result.filter(c => c.offre?.id === this.selectedOffreId);
    }
    this.filteredCandidatures = result;
  }

  changeCandidatureFilter(filter: string): void {
    this.candidatureFilter = filter;
    this.filterCandidatures();
  }

  onOffreChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedOffreId = value ? Number(value) : null;
    this.filterCandidatures();
  }

  acceptCandidature(id: number): void {
    Swal.fire({
      title: 'Accepter cette candidature ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, accepter',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#7c3aed'
    }).then(result => {
      if (result.isConfirmed) {
        this.crudService.changerStatutCandidature(id, 'ACCEPTE').subscribe({
          next: () => {
            this.showSuccess('Candidature acceptée — email envoyé');
            this.loadCandidatures();
          },
          error: () => this.errorMessage = 'Erreur mise à jour'
        });
      }
    });
  }

  declineCandidature(id: number): void {
    Swal.fire({
      title: 'Refuser cette candidature ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, refuser',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc2626'
    }).then(result => {
      if (result.isConfirmed) {
        this.crudService.changerStatutCandidature(id, 'REFUSE').subscribe({
          next: () => {
            this.showSuccess('Candidature refusée — email envoyé');
            this.loadCandidatures();
          },
          error: () => this.errorMessage = 'Erreur mise à jour'
        });
      }
    });
  }

  showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 4000);
  }

  getNomCandidat(c: any): string {
    if (c.etudiant) return `${c.etudiant.prenom} ${c.etudiant.nom}`;
    if (c.candidat)  return `${c.candidat.prenom} ${c.candidat.nom}`;
    return 'Inconnu';
  }

  getEmailCandidat(c: any): string {
    return c.etudiant?.email ?? c.candidat?.email ?? '-';
  }

  getStatutClass(statut: string): string {
    switch (statut?.toUpperCase()) {
      case 'ACCEPTE': return 'bg-green-100 text-green-800';
      case 'REFUSE':  return 'bg-red-100 text-red-800';
      default:        return 'bg-yellow-100 text-yellow-800';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut?.toUpperCase()) {
      case 'ACCEPTE':    return 'Acceptée';
      case 'REFUSE':     return 'Refusée';
      case 'EN_ATTENTE': return 'En attente';
      default:           return statut;
    }
  }

  getOffreTitre(offre: any): string {
    return offre?.titre ?? 'Offre supprimée';
  }

  goToPostJobAction(): void { this.router.navigate(['/entreprise/offreForm']); }
  goToCandidatures(): void  { this.currentView = 'candidatures'; }
  goToDashboard(): void     { this.currentView = 'dashboard'; }

  get nbAcceptees(): number {
    return this.candidatures.filter(c => c.statut?.toUpperCase() === 'ACCEPTE').length;
  }

  get nbEnAttente(): number {
    return this.candidatures.filter(c => c.statut?.toUpperCase() === 'EN_ATTENTE').length;
  }

  get nbRefusees(): number {
    return this.candidatures.filter(c => c.statut?.toUpperCase() === 'REFUSE').length;
  }
  // Ajoutez cette méthode dans la classe
analyserCV(c: any): void {
  const descriptionOffre = c.offre?.description || c.offre?.titre || '';
  
  if (!c.cv) {
    Swal.fire('Aucun CV', 'Ce candidat n\'a pas uploadé de CV.', 'warning');
    return;
  }

  this.analyzingId = c.id;
  
  this.crudService.analyserCV(c.cv, descriptionOffre).subscribe({
    next: (result: any) => {
      this.analysisResults[c.id] = result;
      this.analyzingId = null;
    },
    error: () => {
      this.analyzingId = null;
      Swal.fire('Erreur', 'Impossible d\'analyser le CV.', 'error');
    }
  });
}
}