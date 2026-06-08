import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  searchQuery: string = '';

  constructor(private router: Router) {}

  // Redirige vers la page la plus pertinente selon le terme saisi
  onSearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return;

    if (q.includes('etud'))        this.router.navigate(['/listeetudiant']);
    else if (q.includes('entrep')) this.router.navigate(['/listentreprise']);
    else if (q.includes('instit')) this.router.navigate(['/listinstitution']);
    else if (q.includes('admin'))  this.router.navigate(['/listeadmin']);
    else if (q.includes('offre'))  this.router.navigate(['/listoffres']);
    else if (q.includes('contact'))this.router.navigate(['/listcontact']);
    else if (q.includes('cand'))   this.router.navigate(['/listcandidat']);
    else this.router.navigate(['/home']);

    this.searchQuery = '';
  }
}