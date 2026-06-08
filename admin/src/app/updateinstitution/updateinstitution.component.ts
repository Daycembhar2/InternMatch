import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CRUDService } from '../service/crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Institution } from '../Entites/Institution.Entites';

@Component({
  selector: 'app-updateinstitution',
  templateUrl: './updateinstitution.component.html',
  styleUrls: ['./updateinstitution.component.css']
})
export class UpdateInstitutionComponent {

  institution: Institution | null = null;
  updateForm: FormGroup;
  id: number = 0;
  isLoading = false;
  logoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private crudService: CRUDService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.updateForm = this.fb.group({
      nomFaculte: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mdp: ['']
    });
  }

  get nomFaculte()     { return this.updateForm.get('nomFaculte'); }
  get email()   { return this.updateForm.get('email'); }
  get mdp()     { return this.updateForm.get('mdp'); }
 

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.id || isNaN(this.id)) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'ID institution invalide'
      });
      this.router.navigate(['/listinstitution']); // fallback safe
      return;
    }

    this.crudService.getInstitutionById(this.id).subscribe({
      next: (data: any) => {

  console.log("DATA RECEIVED:", data);

  this.updateForm.patchValue({
    nomFaculte: data.nomFaculte || '',
    email: data.email || ''
  });

},
      error: (err) => {
        console.error('Erreur chargement institution:', err);
        Swal.fire({
          icon: 'error',
          title: 'Chargement échoué',
          text: 'Impossible de charger les informations de l’institution'
        });
        this.router.navigate(['/listinstitution']);
      }
    });
  }

  onSubmit(): void {
    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Formulaire incomplet',
        text: 'Veuillez vérifier les champs obligatoires.'
      });
      return;
    }

    this.isLoading = true;

    const values = this.updateForm.value;
    const mdpToSend = values.mdp?.trim() ? values.mdp : undefined;

    const updatedData = {
      id: this.id,
      nomFaculte: values.nomFaculte,
      email: values.email,
      ...(mdpToSend && { mdp: mdpToSend })
    };

    this.crudService.updateInstitution(this.id, updatedData).subscribe({
      next: (response) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Mise à jour réussie',
          text: 'Les informations de l’institution ont été modifiées.',
          timer: 2200
        });
        this.router.navigate(['/listinstitution']); // ← go to this institution's profile
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Update error:', err);
        let msg = 'Erreur lors de la mise à jour';
        if (err.error?.message) msg = err.error.message;
        Swal.fire({ icon: 'error', title: 'Échec', text: msg });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/listinstitution']);
  }

  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => this.logoPreview = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }
}