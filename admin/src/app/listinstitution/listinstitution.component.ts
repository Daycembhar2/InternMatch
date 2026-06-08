import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Institution } from '../Entites/Institution.Entites';
import { CRUDService } from '../service/crud.service';

@Component({
  selector: 'app-listinstitution',
  templateUrl: './listinstitution.component.html',
  styleUrls: ['./listinstitution.component.css']
})
export class ListinstitutionComponent implements OnInit {

  listeInstitution: Institution[] = [];
  listeFiltered: Institution[] = [];
  role: string = '';
  searchText: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [5, 10, 25, 50];

  constructor(private service: CRUDService, private router: Router) {}

  ngOnInit(): void {
    this.role = localStorage.getItem('role') as string;
    this.chargerInstitutions();
  }

  chargerInstitutions(): void {
    this.service.getAllInstitutions().subscribe({
      next: (institutions) => { this.listeInstitution = institutions; this.appliquerFiltre(); },
      error: () => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de charger les institutions.' })
    });
  }

  onSearch(): void { this.currentPage = 1; this.appliquerFiltre(); }

  appliquerFiltre(): void {
    const t = this.searchText.toLowerCase().trim();
    this.listeFiltered = t
      ? this.listeInstitution.filter(i =>
          i.nomFaculte?.toLowerCase().includes(t) ||
          i.email?.toLowerCase().includes(t))
      : [...this.listeInstitution];
  }

  get totalPages(): number { return Math.ceil(this.listeFiltered.length / this.itemsPerPage); }
  get pagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get institutionsPage(): Institution[] {
    const d = (this.currentPage - 1) * this.itemsPerPage;
    return this.listeFiltered.slice(d, d + this.itemsPerPage);
  }
  get debut(): number { return this.listeFiltered.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1; }
  get fin(): number { return Math.min(this.currentPage * this.itemsPerPage, this.listeFiltered.length); }
  changerPage(p: number): void { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }
  onItemsPerPageChange(): void { this.currentPage = 1; }

  DeleteInstitution(institution: Institution): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?', text: `Supprimer "${institution.nomFaculte}" ?`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer', cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.service.deleteInstitution(institution.id).subscribe({
          next: () => {
            this.listeInstitution = this.listeInstitution.filter(i => i.id !== institution.id);
            this.appliquerFiltre();
            Swal.fire({ icon: 'success', title: 'Supprimé !', timer: 2000, showConfirmButton: false,
              text: 'Institution supprimée avec succès.' });
          },
          error: () => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Erreur lors de la suppression.' })
        });
      }
    });
  }
}