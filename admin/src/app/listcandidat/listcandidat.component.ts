import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Candidat } from '../Entites/Candidat.Entites';
import { CRUDService } from '../service/crud.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { DatatablesFrService } from '../service/datatables-fr.service';


@Component({
  selector: 'app-listcandidat',
  templateUrl: './listcandidat.component.html',
  styleUrls: ['./listcandidat.component.css']
})
export class ListCandidatComponent {
  listeCandidat: Candidat[] = [];
  role: string;
  private subscription: Subscription = new Subscription();
    constructor(private service: CRUDService, private router: Router, private dtFr: DatatablesFrService,) {}
  
    ngOnInit(): void {
      this.role = localStorage.getItem("role") as string;
      // Charge initial + écoute les mises à jour en live
    this.subscription.add(
      this.service.candidats$.subscribe(candidats => {
        this.listeCandidat = candidats;
      })
      // Charge une première fois
   
    );
     this.service.refreshCandidats();
      this.chargerCandidats();
      
    }
    ngAfterViewInit(): void { this.dtFr.init('id_de_votre_table_candidat'); }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();  // évite les fuites mémoire
  }
    chargerCandidats() {
      this.service.getAllCandidats().subscribe({
        next: (candidats) => {
          this.listeCandidat = candidats;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des candidats:', err);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de charger la liste des étudiants'
          });
        }
      });
    }
  
    DeleteCandidat(candidat: Candidat) {
      Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: `Voulez-vous vraiment supprimer le candidat "${candidat.nom} ${candidat.prenom}" ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          this.service.deleteCandidat(candidat.id).subscribe({
            next: () => {
              this.listeCandidat = this.listeCandidat.filter(c => c.id !== candidat.id);
              Swal.fire({
                icon: 'success',
                title: 'Supprimé !',
                text: 'Le candidat a été supprimé avec succès.',
                timer: 2000,
                showConfirmButton: false
              });
            },
            error: (err: any) => {
              console.error('Erreur lors de la suppression:', err);
              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Une erreur est survenue lors de la suppression du candidat .'
              });
            }
          });
        }
      });
    }
  }
  

