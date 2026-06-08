import { Component, OnInit } from '@angular/core';
import { Entreprise } from '../Entites/Entreprise.Entites';
import { CRUDService } from '../service/crud.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-listentreprise',
  templateUrl: './listentreprise.component.html',
  styleUrls: ['./listentreprise.component.css']
})
export class ListentrepriseComponent implements OnInit {

  listeEntreprise: Entreprise[] = [];
  listeFiltered: Entreprise[] = [];
  role: string = '';

  // Recherche
  searchText: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [5, 10, 25, 50];

  constructor(private service: CRUDService, private router: Router) {}

  ngOnInit(): void {
    this.role = localStorage.getItem('role') as string;
    this.chargerEntreprises();
  }

  chargerEntreprises(): void {
    forkJoin({
      entreprises: this.service.getAllEntreprises(),
      offres: this.service.getAllOffres()
    }).subscribe({
      next: ({ entreprises, offres }) => {
        this.listeEntreprise = entreprises.map(e => ({
          ...e,
          offres: offres.filter(o => o.entreprise?.id === e.id)
        }));
        this.appliquerFiltre();
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de charger les entreprises.' });
      }
    });
  }

  // ── Recherche ──────────────────────────────────────────
  onSearch(): void {
    this.currentPage = 1;
    this.appliquerFiltre();
  }

  appliquerFiltre(): void {
    const terme = this.searchText.toLowerCase().trim();
    this.listeFiltered = terme
      ? this.listeEntreprise.filter(e =>
          (e.nomEntreprise?.toLowerCase().includes(terme)) ||
          (e.secteur?.toLowerCase().includes(terme)) ||
          (e.email?.toLowerCase().includes(terme))
        )
      : [...this.listeEntreprise];
  }

  // ── Pagination ─────────────────────────────────────────
  get totalPages(): number {
    return Math.ceil(this.listeFiltered.length / this.itemsPerPage);
  }

  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get entreprisesPage(): Entreprise[] {
    const debut = (this.currentPage - 1) * this.itemsPerPage;
    return this.listeFiltered.slice(debut, debut + this.itemsPerPage);
  }

  get debut(): number {
    return this.listeFiltered.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get fin(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.listeFiltered.length);
  }

  changerPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
  }

  // ── Actions ────────────────────────────────────────────
  updateEntrepriseEtat(entreprise: Entreprise): void {
    const newEtat = !entreprise.etat;
    const action = newEtat ? 'activer' : 'désactiver';
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Voulez-vous vraiment ${action} "${entreprise.nomEntreprise}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newEtat ? '#28a745' : '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: `Oui, ${action}`,
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        entreprise.etat = newEtat;
        this.service.updateEntreprise(entreprise.id, entreprise).subscribe({
          next: () => Swal.fire({ icon: 'success', title: 'Succès !', timer: 2000, showConfirmButton: false,
            text: `Entreprise ${newEtat ? 'activée' : 'désactivée'} avec succès.` }),
          error: () => { entreprise.etat = !newEtat;
            Swal.fire({ icon: 'error', title: 'Erreur', text: 'Erreur lors de la mise à jour.' }); }
        });
      }
    });
  }

  DeleteEntreprise(entreprise: Entreprise): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Supprimer "${entreprise.nomEntreprise}" ?`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer', cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.service.deleteEntreprise(entreprise.id).subscribe({
          next: () => {
            this.listeEntreprise = this.listeEntreprise.filter(e => e.id !== entreprise.id);
            this.appliquerFiltre();
            Swal.fire({ icon: 'success', title: 'Supprimé !', timer: 2000, showConfirmButton: false,
              text: 'Entreprise supprimée avec succès.' });
          },
          error: () => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Erreur lors de la suppression.' })
        });
      }
    });
  }
}