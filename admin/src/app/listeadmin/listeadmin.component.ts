import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Admin } from '../Entites/Admin.Entites';
import { CRUDService } from '../service/crud.service';

@Component({
  selector: 'app-listeadmin',
  templateUrl: './listeadmin.component.html',
  styleUrls: ['./listeadmin.component.css']
})
export class ListeadminComponent implements OnInit {
  p:number=1;
  collection:any[];
  listeAdmin: Admin[] = [];
  listeFiltered: Admin[] = [];
  roleAdmin: string = '';
  searchText: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [5, 10, 25, 50];

  constructor(private service: CRUDService, private router: Router) {}

  ngOnInit(): void {
    this.roleAdmin = localStorage.getItem('roleAdmin') as string;
    this.chargerAdmins();
  }

  chargerAdmins(): void {
    this.service.getAllAdmins().subscribe({
      next: (admins) => { this.listeAdmin = admins; this.appliquerFiltre(); },
      error: () => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de charger les administrateurs.' })
    });
  }

  onSearch(): void { this.currentPage = 1; this.appliquerFiltre(); }

  appliquerFiltre(): void {
    const t = this.searchText.toLowerCase().trim();
    this.listeFiltered = t
      ? this.listeAdmin.filter(a =>
          a.nom?.toLowerCase().includes(t) ||
          a.prenom?.toLowerCase().includes(t) ||
          a.email?.toLowerCase().includes(t))
      : [...this.listeAdmin];
  }

  get totalPages(): number { return Math.ceil(this.listeFiltered.length / this.itemsPerPage); }
  get pagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get adminsPage(): Admin[] {
    const d = (this.currentPage - 1) * this.itemsPerPage;
    return this.listeFiltered.slice(d, d + this.itemsPerPage);
  }
  get debut(): number { return this.listeFiltered.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1; }
  get fin(): number { return Math.min(this.currentPage * this.itemsPerPage, this.listeFiltered.length); }
  changerPage(p: number): void { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }
  onItemsPerPageChange(): void { this.currentPage = 1; }

  DeleteAdmin(admin: Admin): void {
    if (admin.role === 'superadmin') {
      Swal.fire({ icon: 'error', title: 'Non autorisé', text: 'Impossible de supprimer un super administrateur.' });
      return;
    }
    Swal.fire({
      title: 'Êtes-vous sûr ?', text: `Supprimer "${admin.nom} ${admin.prenom}" ?`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer', cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.service.deleteAdmin(admin.id).subscribe({
          next: () => {
            this.listeAdmin = this.listeAdmin.filter(a => a.id !== admin.id);
            this.appliquerFiltre();
            Swal.fire({ icon: 'success', title: 'Supprimé !', timer: 2000, showConfirmButton: false,
              text: 'Administrateur supprimé avec succès.' });
          },
          error: () => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Erreur lors de la suppression.' })
        });
      }
    });
  }
}