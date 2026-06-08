import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CRUDService } from '../service/crud.service';
import { Entreprise } from '../Entites/Entreprise.Entites';
@Component({
  selector: 'app-ajouterentreprise',
  templateUrl: './ajouterentreprise.component.html',
  styleUrls: ['./ajouterentreprise.component.css']
})
export class AjouterentrepriseComponent {
  entrepriseForm: FormGroup;
    messageCommande: string = '';
  
    constructor(
      private services: CRUDService,
      private router: Router,
      private fb: FormBuilder
    ) {
      this.entrepriseForm = this.fb.group({
        nom: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern("^[a-zA-ZÀ-ÿ\\s'-]+$") // Only alphabetic characters
        ]),
        secteur: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern("^[a-zA-ZÀ-ÿ\\s'-]+$") // Only alphabetic characters
        ]),
        email: new FormControl('', [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@gmail\\.com$') // Must end with @gmail.com
        ]),
        mdp: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern('^[a-zA-Z0-9]+$') // Alphanumeric
        ]),
        role: new FormControl('', [
          Validators.required
        ])
      });
    }
  
    ngOnInit(): void {
      // Initialization code if needed
    }
  
    // Getters for form controls
    get nom() { return this.entrepriseForm.get('nom'); }
    get secteur() { return this.entrepriseForm.get('secteur'); }
    get email() { return this.entrepriseForm.get('email'); }
    get mdp() { return this.entrepriseForm.get('mdp'); }
    get role() { return this.entrepriseForm.get('role'); }
    // Helper method to show error messages
    getErrorMessage(control: any, fieldName: string) {
      if (control.hasError('required')) {
        return `Le champ ${fieldName} est obligatoire`;
      }
      if (control.hasError('minlength')) {
        return `Le champ ${fieldName} doit contenir au moins ${control.errors.minlength.requiredLength} caractères`;
      }
      if (control.hasError('pattern')) {
        switch(fieldName) {
          case 'nom':
          case 'secteur':
            return 'Seuls les caractères alphabétiques sont autorisés';
          case 'email':
            return 'L\'email doit se terminer par @gmail.com';
          case 'mdp':
            return 'Le mot de passe doit contenir uniquement des caractères alphanumériques';
          default:
            return 'Format invalide';
        }
      }
      return '';
    }
  
    addNewEntreprise() {
      if (this.entrepriseForm.invalid) {
        // Show specific error messages for each invalid field
        Object.keys(this.entrepriseForm.controls).forEach(key => {
          const control = this.entrepriseForm.get(key);
          if (control?.invalid) {
            const errorMessage = this.getErrorMessage(control, key);
            Swal.fire({
              icon: 'error',
              title: 'Champ invalide',
              text: errorMessage
            });
          }
        });
        return;
      }
  
      const data = this.entrepriseForm.value;
      const entreprise = new Entreprise(undefined, data.nom, data.secteur, data.email, data.mdp, data.role);
  
      this.services.addEntreprise(entreprise).subscribe({
        next: (res :any) => {
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Entreprise ajoutée avec succès !',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/listeentreprise']).then(() => {
              window.location.reload();
            });
          });
        },
        error: (err : any) => {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur s\'est produite lors de l\'ajout de l\'entreprise'
          });
        }
      });
    }
  }
  
  

