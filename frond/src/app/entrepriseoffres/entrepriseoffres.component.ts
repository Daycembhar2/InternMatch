import { Component, OnInit } from '@angular/core';
import { OffreService } from '../service/offre.service';
import { CRUDService } from '../service/crud.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-entrepriseoffres',
  templateUrl: './entrepriseoffres.component.html',
  styleUrls: ['./entrepriseoffres.component.css']
})
export class EntrepriseoffresComponent implements OnInit {

  offres: any[] = [];
  isLoading = true;
  errorMessage = '';
  entrepriseId!: number;

  searchTerm = '';
  selectedType = '';

  // ✅ Feedbacks par offre
  feedbacksMap: { [offreId: number]: any[] } = {};
  feedbacksOuverts: { [offreId: number]: boolean } = {};

  constructor(
    private offreService: OffreService,
    private crudService: CRUDService,
    public router: Router
  ) {}

  ngOnInit(): void {
    const user = this.crudService.userDetails();
    if (!user || user.role?.toUpperCase() !== 'ENTREPRISE') {
      this.router.navigate(['/signin']);
      return;
    }
    this.entrepriseId = user.id;
    this.chargerOffres();
  }

  chargerOffres(): void {
    this.isLoading = true;
    this.offreService.getOffresByEntreprise(this.entrepriseId).subscribe({
      next: (data) => {
        this.offres = data || [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger vos offres.';
        this.isLoading = false;
      }
    });
  }

  //  Charger les feedbacks d'une offre et ouvrir/fermer le panneau
  toggleFeedbacks(offreId: number): void {
    this.feedbacksOuverts[offreId] = !this.feedbacksOuverts[offreId];

    if (this.feedbacksOuverts[offreId] && !this.feedbacksMap[offreId]) {
      this.crudService.getFeedbacksOffre(offreId).subscribe({
        next: (data) => { this.feedbacksMap[offreId] = data || []; },
        error: () => { this.feedbacksMap[offreId] = []; }
      });
    }
  }

  //  Moyenne des notes
  getMoyenne(offreId: number): string {
    const feedbacks = this.feedbacksMap[offreId];
    if (!feedbacks || feedbacks.length === 0) return '—';
    const sum = feedbacks.reduce((acc, f) => acc + (f.note || 0), 0);
    return (sum / feedbacks.length).toFixed(1);
  }

  get offresFiltrees(): any[] {
    return this.offres.filter(o => {
      const matchSearch = !this.searchTerm ||
        o.titre?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        o.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        o.localisation?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchType = !this.selectedType ||
        o.type?.toLowerCase().includes(this.selectedType.toLowerCase());
      return matchSearch && matchType;
    });
  }

  modifierOffre(offreId: number): void {
    this.router.navigate(['/entreprise/offreForm'], { queryParams: { id: offreId } });
  }

  supprimerOffre(offreId: number): void {
    Swal.fire({
      title: 'Supprimer cette offre ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.offreService.deleteOffre(offreId).subscribe({
          next: () => {
            this.offres = this.offres.filter(o => o.id !== offreId);
            Swal.fire({ icon: 'success', title: 'Supprimée !', text: "L'offre a été supprimée.", timer: 1500, showConfirmButton: false });
          },
          error: () => {
            Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de supprimer cette offre.' });
          }
        });
      }
    });
  }

  publierOffre(): void {
    this.router.navigate(['/entreprise/offreForm']);
  }

  getTypeBadgeClass(type: string): string {
    const t = type?.toLowerCase() || '';
    if (t.includes('stage') || t.includes('pfe')) return 'bg-sky-500/20 text-sky-500';
    if (t.includes('emploi') || t.includes('cdi') || t.includes('cdd')) return 'bg-green-500/20 text-green-500';
    if (t.includes('freelance')) return 'bg-violet-500/20 text-violet-500';
    return 'bg-gray-500/20 text-gray-500';
  }

  isExpired(dateExpiration: any): boolean {
    if (!dateExpiration) return false;
    return new Date() > new Date(dateExpiration);
  }
}