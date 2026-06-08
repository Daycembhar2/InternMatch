import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Etudiant } from '../Entites/Etudiant.Entites';
import { CRUDService } from '../service/crud.service';

@Component({
  selector: 'app-listeetudiant',
  templateUrl: './listeetudiant.component.html',
  styleUrls: ['./listeetudiant.component.css']
})
export class ListeEtudiantComponent implements OnInit {

  listeEtudiant: Etudiant[] = [];
  listeFiltered: Etudiant[] = [];
  role: string = '';
  searchText: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [5, 10, 25, 50];

  constructor(private service: CRUDService, private router: Router) {}

  ngOnInit(): void {
    this.role = localStorage.getItem('role') as string;
    this.chargerEtudiants();
  }

  chargerEtudiants(): void {
    this.service.getAllEtudiants().subscribe({
      next: (etudiants) => {
        this.listeEtudiant = etudiants;
        this.appliquerFiltre();
      },
      error: () => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de charger les étudiants.' })
    });
  }

  onSearch(): void { this.currentPage = 1; this.appliquerFiltre(); }

  appliquerFiltre(): void {
    const t = this.searchText.toLowerCase().trim();
    this.listeFiltered = t
      ? this.listeEtudiant.filter(e =>
          e.nom?.toLowerCase().includes(t) ||
          e.prenom?.toLowerCase().includes(t) ||
          e.email?.toLowerCase().includes(t) ||
          e.faculte?.toLowerCase().includes(t) ||
          e.specialite?.toLowerCase().includes(t))
      : [...this.listeEtudiant];
  }

  get totalPages(): number { return Math.ceil(this.listeFiltered.length / this.itemsPerPage); }
  get pagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get etudiantsPage(): Etudiant[] {
    const d = (this.currentPage - 1) * this.itemsPerPage;
    return this.listeFiltered.slice(d, d + this.itemsPerPage);
  }
  get debut(): number { return this.listeFiltered.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1; }
  get fin(): number { return Math.min(this.currentPage * this.itemsPerPage, this.listeFiltered.length); }
  changerPage(p: number): void { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }
  onItemsPerPageChange(): void { this.currentPage = 1; }

  DeleteEtudiant(etudiant: Etudiant): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Supprimer "${etudiant.nom} ${etudiant.prenom}" ?`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer', cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.service.deleteEtudiant(etudiant.id).subscribe({
          next: () => {
            this.listeEtudiant = this.listeEtudiant.filter(e => e.id !== etudiant.id);
            this.appliquerFiltre();
            Swal.fire({ icon: 'success', title: 'Supprimé !', timer: 2000, showConfirmButton: false,
              text: 'Étudiant supprimé avec succès.' });
          },
          error: () => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Erreur lors de la suppression.' })
        });
      }
    });
  }
}