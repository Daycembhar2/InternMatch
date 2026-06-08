import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CRUDService } from '../service/crud.service';

@Component({
  selector: 'app-updateoffre',
  templateUrl: './updateoffre.component.html',
  styleUrls: ['./updateoffre.component.css']
})
export class UpdateOffreComponent implements OnInit {

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
      titre:            ['', [Validators.required, Validators.minLength(3)]],
      type:             ['', Validators.required],
      secteur:          ['', Validators.required],
      localisation:     ['', Validators.required],
      description:      [''],
      dateExpiration:   ['', Validators.required],
      statutValidation: ['en attente']
    });
  }

  get titre()          { return this.updateForm.get('titre'); }
  get type()           { return this.updateForm.get('type'); }
  get secteur()        { return this.updateForm.get('secteur'); }
  get localisation()   { return this.updateForm.get('localisation'); }
  get dateExpiration() { return this.updateForm.get('dateExpiration'); }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.id || isNaN(this.id)) {
      Swal.fire({ icon: 'error', title: 'Erreur', text: 'ID offre invalide' });
      this.router.navigate(['/listoffres']);
      return;
    }

    this.crudService.getOffreById(this.id).subscribe({
      next: (data: any) => {
        this.updateForm.patchValue({
          titre:            data.titre || '',
          type:             data.type || '',
          secteur:          data.secteur || '',
          localisation:     data.localisation || '',
          description:      data.description || '',
          dateExpiration:   data.dateExpiration
                              ? data.dateExpiration.substring(0, 10)
                              : '',
          statutValidation: data.statutValidation || 'en attente'
        });
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de charger l\'offre.' });
        this.router.navigate(['/listoffres']);
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
    const updatedData = { id: this.id, ...this.updateForm.value };

    this.crudService.updateOffre(this.id, updatedData).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({ icon: 'success', title: 'Mise à jour réussie',
          text: 'L\'offre a été modifiée avec succès.', timer: 2200 });
        this.router.navigate(['/listoffres']);
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({ icon: 'error', title: 'Échec',
          text: err.error?.message || 'Erreur lors de la mise à jour.' });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/listoffres']);
  }
}