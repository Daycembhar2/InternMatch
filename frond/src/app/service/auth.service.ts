import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CRUDService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private service: CRUDService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    // 1. Vérifier si connecté
    if (!this.service.isLoggedIn()) {
      this.router.navigate(['/signin']);
      return false;
    }

    // 2. Vérifier le rôle si des rôles sont définis sur la route
    const expectedRoles: string[] = next.data['roles'];

    if (expectedRoles && expectedRoles.length > 0) {
      const user = this.service.userDetails();
      const userRole = user?.role?.toUpperCase();
      const hasRole = expectedRoles.some(r => r.toUpperCase() === userRole);

      if (!hasRole) {
        // Redirige vers la bonne page selon son rôle
        this.redirectByRole(userRole);
        return false;
      }
    }

    return true;
  }

  private redirectByRole(role: string): void {
    switch (role) {
      case 'ETUDIANT':    this.router.navigate(['/etudiant/home']);   break;
      case 'CANDIDAT':    this.router.navigate(['/candidat/home']);   break;
      case 'ENTREPRISE':  this.router.navigate(['/entreprise/home']); break;
      case 'INSTITUTION': this.router.navigate(['/institution/home']); break;
      case 'ADMIN':       this.router.navigate(['/admin']);            break;
      default:            this.router.navigate(['/signin']);           break;
    }
  }
}