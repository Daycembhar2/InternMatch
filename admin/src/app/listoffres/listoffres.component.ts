import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Offre } from '../Entites/Offre.Entites';
import { CRUDService } from '../service/crud.service';

@Component({
  selector: 'app-listoffres',
  templateUrl: './listoffres.component.html',
  styleUrls: ['./listoffres.component.css']
})
export class ListoffresComponent implements OnInit {

  listeOffres: Offre[] = [];
  listeFiltered: Offre[] = [];
  searchText: string = '';
  filterType: string = '';
  filterStatut: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [5, 10, 25, 50];

  constructor(private service: CRUDService, private router: Router) {}

  ngOnInit(): void { this.chargerOffres(); }

  chargerOffres(): void {
    this.service.getAllOffres().subscribe({
      next: (data) => { this.listeOffres = data; this.appliquerFiltre(); },
      error: (err) => console.error('Erreur :', err)
    });
  }

  onSearch(): void { this.currentPage = 1; this.appliquerFiltre(); }

  appliquerFiltre(): void {
    const t = this.searchText.toLowerCase().trim();
    this.listeFiltered = this.listeOffres.filter(o =>
      (!t || o.titre?.toLowerCase().includes(t) ||
             o.nomentreprise?.toLowerCase().includes(t) ||
             o.localisation?.toLowerCase().includes(t)) &&
      (!this.filterType   || o.type === this.filterType) &&
      (!this.filterStatut || o.statutValidation === this.filterStatut)
    );
  }

  get totalPages(): number { return Math.ceil(this.listeFiltered.length / this.itemsPerPage); }
  get pagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get offresPage(): Offre[] {
    const d = (this.currentPage - 1) * this.itemsPerPage;
    return this.listeFiltered.slice(d, d + this.itemsPerPage);
  }
  get debut(): number { return this.listeFiltered.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1; }
  get fin(): number { return Math.min(this.currentPage * this.itemsPerPage, this.listeFiltered.length); }
  changerPage(p: number): void { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }
  onItemsPerPageChange(): void { this.currentPage = 1; }

  deleteOffre(offre: Offre): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?', text: `Supprimer "${offre.titre}" ?`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer', cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.service.deleteOffre(offre.id!).subscribe({
          next: () => {
            this.listeOffres = this.listeOffres.filter(o => o.id !== offre.id);
            this.appliquerFiltre();
            Swal.fire({ icon: 'success', title: 'Supprimé !', timer: 2000, showConfirmButton: false });
          },
          error: () => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Erreur lors de la suppression.' })
        });
      }
    });
  }

  toggleEtat(offre: Offre): void {
    const updated = { ...offre, statutValidation: offre.statutValidation === 'validée' ? 'rejetée' : 'validée' };
    this.service.updateOffreEtat(offre.id!, updated).subscribe({
      next: () => {
        const i = this.listeOffres.findIndex(o => o.id === offre.id);
        if (i !== -1) { this.listeOffres[i] = updated; this.appliquerFiltre(); }
      },
      error: () => console.error('Erreur mise à jour.')
    });
  }
}