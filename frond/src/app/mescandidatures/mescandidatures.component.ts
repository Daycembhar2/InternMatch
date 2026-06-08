import { Component } from '@angular/core';
import { CRUDService } from '../service/crud.service';

@Component({
  selector: 'app-mescandidatures',
  templateUrl: './mescandidatures.component.html',
  styleUrls: ['./mescandidatures.component.css']
})
export class MescandidaturesComponent {


  candidatures: any[] = [];
  filteredCandidatures: any[] = [];
  activeFilter = 'all';
  loading = false;
  etudiantId!: number;

  constructor(private crudService: CRUDService) {}

  ngOnInit(): void {
    const user = this.crudService.userDetails();
    this.etudiantId = user?.id;
    this.loadCandidatures();
  }
 loadCandidatures(): void {
  this.loading = true;
  const role = (this.crudService.userDetails()?.role || '').toUpperCase();

  const endpoint = role === 'CANDIDAT'
    ? `postulation/candidat/${this.etudiantId}`
    : `postulation/etudiant/${this.etudiantId}`;

  this.crudService.getAll<any>(endpoint).subscribe({
    next: (data) => {
      this.candidatures = data.map((c: any) => ({
        ...c,
        noteTemp: null,    
        noteHover: 0,
        commentaireTemp: ''
      }));
      this.filterCandidatures();
      this.loading = false;
    },
    error: () => this.loading = false
  });
}


setHover(c: any, val: number): void {
  c.noteHover = val;
}

clearHover(c: any): void {
  c.noteHover = 0;
}

  filterCandidatures(): void {
    if (this.activeFilter === 'all') {
      this.filteredCandidatures = [...this.candidatures];
    } else {
      this.filteredCandidatures = this.candidatures.filter(
        c => c.statut?.toUpperCase() === this.activeFilter
      );
    }
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.filterCandidatures();
  }

  getStatutClass(statut: string): string {
    switch (statut?.toUpperCase()) {
      case 'ACCEPTE':    return 'bg-green-100 text-green-800 border border-green-200';
      case 'REFUSE':     return 'bg-red-100 text-red-800 border border-red-200';
      default:           return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut?.toUpperCase()) {
      case 'ACCEPTE':    return '✓ Acceptée';
      case 'REFUSE':     return '✗ Refusée';
      default:           return '⏳ En attente';
    }
  }

  getStatutIcon(statut: string): string {
    switch (statut?.toUpperCase()) {
      case 'ACCEPTE': return '🎉';
      case 'REFUSE':  return '😞';
      default:        return '⏳';
    }
  }

  get nbEnAttente(): number {
    return this.candidatures.filter(c => c.statut?.toUpperCase() === 'EN_ATTENTE').length;
  }

  get nbAcceptees(): number {
    return this.candidatures.filter(c => c.statut?.toUpperCase() === 'ACCEPTE').length;
  }

  get nbRefusees(): number {
    return this.candidatures.filter(c => c.statut?.toUpperCase() === 'REFUSE').length;
  }
  envoyerFeedback(c: any): void {
  this.crudService.update('postulation', c.id + '/feedback', {
    note: c.noteTemp,
    commentaire: c.commentaireTemp
  }).subscribe({
    next: () => {
      c.note = c.noteTemp;
      c.commentaire = c.commentaireTemp;
    },
    error: (err) => console.error('Erreur feedback :', err)
  });
}
retirerCandidature(c: any): void {
  if (!confirm('Voulez-vous vraiment retirer cette candidature ?')) return;

  this.crudService.delete('postulation', c.id).subscribe({
    next: () => {
      this.candidatures = this.candidatures.filter(x => x.id !== c.id);
      this.filterCandidatures();
    },
    error: (err) => console.error('Erreur retrait :', err)
  });
}
}

