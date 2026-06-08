import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Contact } from '../Entites/Contact.Entites';
import { CRUDService } from '../service/crud.service';

@Component({
  selector: 'app-listcontact',
  templateUrl: './listcontact.component.html',
  styleUrls: ['./listcontact.component.css']
})
export class ListcontactComponent implements OnInit {

  listeContact: Contact[] = [];
  listeFiltered: Contact[] = [];
  role: string = '';
  searchText: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [5, 10, 25, 50];

  constructor(private service: CRUDService, private router: Router) {}

  ngOnInit(): void {
    this.role = localStorage.getItem('role') as string;
    this.chargerContacts();
  }

  chargerContacts(): void {
    this.service.getAllContacts().subscribe({
      next: (contacts) => { this.listeContact = contacts; this.appliquerFiltre(); },
      error: () => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de charger les contacts.' })
    });
  }

  onSearch(): void { this.currentPage = 1; this.appliquerFiltre(); }

  appliquerFiltre(): void {
    const t = this.searchText.toLowerCase().trim();
    this.listeFiltered = t
      ? this.listeContact.filter(c =>
          c.nom?.toLowerCase().includes(t) ||
          c.email?.toLowerCase().includes(t) ||
          c.subject?.toLowerCase().includes(t) ||
          c.comments?.toLowerCase().includes(t))
      : [...this.listeContact];
  }

  get totalPages(): number { return Math.ceil(this.listeFiltered.length / this.itemsPerPage); }
  get pagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get contactsPage(): Contact[] {
    const d = (this.currentPage - 1) * this.itemsPerPage;
    return this.listeFiltered.slice(d, d + this.itemsPerPage);
  }
  get debut(): number { return this.listeFiltered.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1; }
  get fin(): number { return Math.min(this.currentPage * this.itemsPerPage, this.listeFiltered.length); }
  changerPage(p: number): void { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }
  onItemsPerPageChange(): void { this.currentPage = 1; }

  DeleteContact(contact: Contact): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?', text: `Supprimer "${contact.nom}" ?`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer', cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.service.deleteContact(contact.id).subscribe({
          next: () => {
            this.listeContact = this.listeContact.filter(c => c.id !== contact.id);
            this.appliquerFiltre();
            Swal.fire({ icon: 'success', title: 'Supprimé !', timer: 2000, showConfirmButton: false });
          },
          error: () => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Erreur lors de la suppression.' })
        });
      }
    });
  }
}