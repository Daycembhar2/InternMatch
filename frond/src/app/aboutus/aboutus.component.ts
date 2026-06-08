import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CRUDService } from '../service/crud.service';

@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.css']
})
export class AboutusComponent implements OnInit {

  constructor(private router: Router, private crudService: CRUDService) {}

  ngOnInit(): void {}

  goToHome(): void {
    const user = this.crudService.userDetails();
    const role = (user?.role || '').toUpperCase().trim();

    switch (role) {
      case 'ETUDIANT':    this.router.navigate(['/etudiant/home']);    break;
      case 'CANDIDAT':    this.router.navigate(['/candidat/home']);    break;
      case 'ENTREPRISE':  this.router.navigate(['/entreprise/home']);  break;
      case 'INSTITUTION': this.router.navigate(['/institution/home']); break;
      default:            this.router.navigate(['/']);
    }
  }
}