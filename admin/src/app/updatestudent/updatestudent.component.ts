import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CRUDService } from '../service/crud.service';

@Component({
  selector: 'app-updatestudent',
  templateUrl: './updatestudent.component.html',
  styleUrls: ['./updatestudent.component.css']
})
export class UpdatestudentComponent {



  updateForm: FormGroup;
  id: number = 0;
  isLoading = false;
  listeInstitutions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private crudService: CRUDService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.updateForm = this.fb.group({
      nom:          ['', [Validators.required, Validators.minLength(2)]],
      prenom:       ['', [Validators.required, Validators.minLength(2)]],
      email:        ['', [Validators.required, Validators.email]],
      mdp:          [''],
      niveau:       [''],
      specialite:   [''],
      faculte:      [''],
      cv:           [''],
      institutionId:[''],
      etat:         [true]
    });
  }

  get nom()        { return this.updateForm.get('nom'); }
  get prenom()     { return this.updateForm.get('prenom'); }
  get email()      { return this.updateForm.get('email'); }
  get niveau()     { return this.updateForm.get('niveau'); }
  get specialite() { return this.updateForm.get('specialite'); }
  get faculte()    { return this.updateForm.get('faculte'); }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.id || isNaN(this.id)) {
      Swal.fire({ icon: 'error', title: 'Erreur', text: 'ID étudiant invalide' });
      this.router.navigate(['/listeetudiant']);
      return;
    }

    // Charger les institutions pour le select
    this.crudService.getAllInstitutions().subscribe({
      next: (data) => this.listeInstitutions = data,
      error: () => console.error('Impossible de charger les institutions')
    });

    // Charger les données de l'étudiant
    this.crudService.getEtudiantById(this.id).subscribe({
      next: (data: any) => {
        this.updateForm.patchValue({
          nom:           data.nom          || '',
          prenom:        data.prenom        || '',
          email:         data.email         || '',
          niveau:        data.niveau        || '',
          specialite:    data.specialite    || '',
          faculte:       data.faculte       || '',
          cv:            data.cv            || '',
          institutionId: data.institutionId || '',
          etat:          data.etat ?? true
        });
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Erreur',
          text: 'Impossible de charger les informations de l\'étudiant.' });
        this.router.navigate(['/listeetudiant']);
      }
    });
  }

  onSubmit(): void {
    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      Swal.fire({ icon: 'warning', title: 'Formulaire incomplet',
        text: 'Veuillez vérifier les champs obligatoires.' });
      return;
    }

    this.isLoading = true;
    const values = this.updateForm.value;
    const mdpToSend = values.mdp?.trim() ? values.mdp : undefined;

    const updatedData = {
      id:           this.id,
      nom:          values.nom,
      prenom:       values.prenom,
      email:        values.email,
      niveau:       values.niveau,
      specialite:   values.specialite,
      faculte:      values.faculte,
      cv:           values.cv,
      etat:         values.etat,
      institutionId:values.institutionId || null,
      ...(mdpToSend && { mdp: mdpToSend })
    };

    this.crudService.updateEtudiant(this.id, updatedData).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({ icon: 'success', title: 'Mise à jour réussie',
          text: 'L\'étudiant a été modifié avec succès.', timer: 2200 });
        this.router.navigate(['/listeetudiant']);
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({ icon: 'error', title: 'Échec',
          text: err.error?.message || 'Erreur lors de la mise à jour.' });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/listeetudiant']);
  }
}