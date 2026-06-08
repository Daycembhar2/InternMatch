import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CRUDService } from '../service/crud.service';
import { OffreService } from '../service/offre.service';

@Component({
  selector: 'app-offredetails',
  templateUrl: './offredetails.component.html',
  styleUrls: ['./offredetails.component.css']
})
export class OffredetailsComponent {
   offre: any = null;
  feedbacks: any[] = [];
  moyenneNote: number = 0;
  loading = true;
  isLoggedIn = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private offreService: OffreService,
    private crudService: CRUDService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.crudService.isLoggedIn();
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Charger l'offre
    this.offreService.getOffreById(id).subscribe({
      next: (data) => {
        this.offre = data;
         if (this.offre.image) {
    this.offre.image = 'http://localhost:4200/assets/images/uploads/' + this.offre.image;
  }
        this.loading = false;
        this.loadFeedbacks(id);
      },
      error: () => this.loading = false
    });
  }

  loadFeedbacks(offreId: number): void {
    this.crudService.getFeedbacksOffre(offreId).subscribe({
      next: (data) => {
        this.feedbacks = data;
        if (data.length > 0) {
          const total = data.reduce((sum: number, f: any) => sum + f.note, 0);
          this.moyenneNote = Math.round((total / data.length) * 10) / 10;
        }
      },
      error: (err) => console.error('Erreur feedbacks :', err)
    });
  }

  postuler(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/signin']);
      return;
    }
    this.router.navigate(['/postulation', this.offre.id]);
  }

  getEtoiles(note: number): number[] {
    return [1, 2, 3, 4, 5];
  }
}
