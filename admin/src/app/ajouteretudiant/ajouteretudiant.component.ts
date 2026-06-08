import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CRUDService } from '../service/crud.service';
import { Etudiant } from '../Entites/Etudiant.Entites';

@Component({
  selector: 'app-ajouteretudiant',
  templateUrl: './ajouteretudiant.component.html',
  styleUrls: ['./ajouteretudiant.component.css']
})
export class AjouterEtudiantComponent {
  etudiantForm: FormGroup;
  messageCommande: string = '';
  cvFile: File | null = null; // <-- variable pour stocker le CV

  constructor(
    private services: CRUDService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.etudiantForm = this.fb.group({
      nom: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern("^[a-zA-ZÀ-ÿ\\s'-]+$")
      ]),
      prenom: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern("^[a-zA-ZÀ-ÿ\\s'-]+$")
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@gmail\\.com$')
      ]),
      mdp: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z0-9]+$')
      ]),
      role: new FormControl('', [
        Validators.required
      ])
    });
  }

  ngOnInit(): void {}

  // Getter pour CV
  get cv() { return this.etudiantForm.get('cv'); }

  // Méthode appelée lors de la sélection du fichier
  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.cvFile = event.target.files[0];
      console.log('Fichier sélectionné :', this.cvFile.name);
    }
  }

  // Gestion des erreurs
  getErrorMessage(control: any, fieldName: string) {
    if (control.hasError('required')) return `Le champ ${fieldName} est obligatoire`;
    if (control.hasError('minlength')) return `Le champ ${fieldName} doit contenir au moins ${control.errors.minlength.requiredLength} caractères`;
    if (control.hasError('pattern')) {
      switch(fieldName) {
        case 'nom':
        case 'prenom': return 'Seuls les caractères alphabétiques sont autorisés';
        case 'email': return 'L\'email doit se terminer par @gmail.com';
        case 'mdp': return 'Le mot de passe doit contenir uniquement des caractères alphanumériques';
        default: return 'Format invalide';
      }
    }
    return '';
  }

  // Ajouter un nouvel étudiant
  addNewEtudiant() {
    if (this.etudiantForm.invalid) {
      Object.keys(this.etudiantForm.controls).forEach(key => {
        const control = this.etudiantForm.get(key);
        if (control?.invalid) {
          Swal.fire({
            icon: 'error',
            title: 'Champ invalide',
            text: this.getErrorMessage(control, key)
          });
        }
      });
      return;
    }

    const data = this.etudiantForm.value;

    // Créer FormData pour inclure le fichier CV
    const formData = new FormData();
    formData.append('nom', data.nom);
    formData.append('prenom', data.prenom);
    formData.append('email', data.email);
    formData.append('mdp', data.mdp);
    formData.append('role', data.role);
    if (this.cvFile) formData.append('cv', this.cvFile, this.cvFile.name);

    // Appel au service
    this.services.addEtudiant(formData as any).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Etudiant ajouté avec succès !',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/home']).then(() => window.location.reload());
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur s\'est produite lors de l\'ajout de l\'etudiant'
        });
      }
    });
  }
}