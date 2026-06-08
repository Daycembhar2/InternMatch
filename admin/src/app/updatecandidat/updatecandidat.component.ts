import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CRUDService } from '../service/crud.service';

@Component({
  selector: 'app-updatecandidat',
  templateUrl: './updatecandidat.component.html',
  styleUrls: ['./updatecandidat.component.css']
})
export class UpdatecandidatComponent implements OnInit {

  updateForm: FormGroup;
  id: number = 0;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private crudService: CRUDService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.updateForm = this.fb.group({
      nom:         ['', [Validators.required, Validators.minLength(2)]],
      prenom:      ['', [Validators.required, Validators.minLength(2)]],
      email:       ['', [Validators.required, Validators.email]],
      mdp:         [''],
      competences: [''],
      cv:          ['']
    });
  }

  get nom()        { return this.updateForm.get('nom'); }
  get prenom()     { return this.updateForm.get('prenom'); }
  get email()      { return this.updateForm.get('email'); }
  get competences(){ return this.updateForm.get('competences'); }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.id || isNaN(this.id)) {
      Swal.fire({ icon: 'error', title: 'Erreur', text: 'ID candidat invalide' });
      this.router.navigate(['/listcandidat']);
      return;
    }

    this.crudService.getCandidatById(this.id).subscribe({
      next: (data: any) => {
        this.updateForm.patchValue({
          nom:         data.nom         || '',
          prenom:      data.prenom      || '',
          email:       data.email       || '',
          competences: data.competences || '',
          cv:          data.cv          || ''
        });
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Erreur',
          text: 'Impossible de charger les informations du candidat.' });
        this.router.navigate(['/listcandidat']);
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
      id:          this.id,
      nom:         values.nom,
      prenom:      values.prenom,
      email:       values.email,
      competences: values.competences,
      cv:          values.cv,
      ...(mdpToSend && { mdp: mdpToSend })
    };

    this.crudService.updateCandidat(this.id, updatedData).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({ icon: 'success', title: 'Mise à jour réussie',
          text: 'Le candidat a été modifié avec succès.', timer: 2200 });
        this.router.navigate(['/listcandidat']);
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({ icon: 'error', title: 'Échec',
          text: err.error?.message || 'Erreur lors de la mise à jour.' });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/listcandidat']);
  }
}