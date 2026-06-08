import { Component } from '@angular/core';
import { CRUDService } from '../service/crud.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  userDetails: any;
  currentYear: number = new Date().getFullYear();

  constructor(private service: CRUDService, private router: Router) {
    this.userDetails = this.service.getUserDetails();
  }

  ngOnInit(): void {
    const rawUser = this.service.getUserDetails();
    this.userDetails = rawUser?.data || rawUser || null;
    console.log('Détails utilisateur :', this.userDetails);
  }

  goToProfil(): void {
    if (this.userDetails?.id) {
      this.router.navigate(['/profil', this.userDetails.id]);
    } else {
      Swal.fire('Attention', 'Veuillez vous connecter pour accéder à votre profil', 'warning');
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    Swal.fire({
      title: 'Déconnexion',
      text: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, se déconnecter',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        sessionStorage.clear();
        this.router.navigate(['/']).then(() => {
          window.location.reload();
        });
      }
    });
  }
}