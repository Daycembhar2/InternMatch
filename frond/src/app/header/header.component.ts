import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  isLoggedIn = false;
  userName = '';
  profilePic = 'assets/images/user/default-avatar.png';
  userRole = '';
  menuOpen = false; 

  constructor(private router: Router, private authService: AuthenticationService) {}

  ngOnInit(): void {
  // Les BehaviorSubjects sont déjà chargés depuis le token dans le constructor
  this.authService.isLoggedIn$.subscribe(v => this.isLoggedIn = v);
  this.authService.userName$.subscribe(v => this.userName = v);
  this.authService.profilePic$.subscribe(v => this.profilePic = v);
  this.authService.userRole$.subscribe(v => this.userRole = v);
}

toggleMenu(event: MouseEvent): void {
  event.stopPropagation(); // ✅ empêche le clic de remonter au document
  this.menuOpen = !this.menuOpen;
}
// Close menu when i clique outside
@HostListener('document:click')
onDocumentClick(): void {
  this.menuOpen = false; // ferme si clic en dehors
}

 

  goToProfile(): void {
    const role = localStorage.getItem('role');
    if (role === 'ETUDIANT') {
      this.router.navigate(['/etudiant/profile']);
    } else if (role === 'ENTREPRISE') {
      this.router.navigate(['/entreprise/profile']);
    } else if (role === 'CANDIDAT') {
      this.router.navigate(['/candidat/profile']);
    } else {
      this.router.navigate(['/profile']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  showNotAllowed(): void {
    alert("La publication d'offres est réservée aux comptes Entreprise.");
  }
  goToHome(): void {
  switch (this.userRole?.toUpperCase()) {
    case 'ETUDIANT':    this.router.navigate(['/etudiant/home']);    break;
    case 'CANDIDAT':    this.router.navigate(['/candidat/home']);    break;
    case 'ENTREPRISE':  this.router.navigate(['/entreprise/home']);  break;
    case 'INSTITUTION': this.router.navigate(['/institution/home']); break;
    default:            this.router.navigate(['/']);
  }
}
}
