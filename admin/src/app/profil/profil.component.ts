import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CRUDService } from '../service/crud.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {
  userDetails: any = null;

  constructor(private service: CRUDService, private router: Router) {}

  ngOnInit(): void {
    const rawUser = this.service.getUserDetails();
    this.userDetails = rawUser?.data || rawUser || null;
    console.log('Profil — userDetails :', this.userDetails);
  }
}