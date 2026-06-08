import { Component } from '@angular/core';
import { Entreprise } from '../Entites/Entreprise.Entites';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CRUDService } from '../service/crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-updateentreprise',
  templateUrl: './updateentreprise.component.html',
  styleUrls: ['./updateentreprise.component.css']
})
export class UpdateEntrepriseComponent {

  entreprise: Entreprise | null = null;
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
      nomEntreprise: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mdp: [''],
      secteur: ['', Validators.maxLength(80)],
      etat: [true]
    });
  }

  get nomEntreprise()     { return this.updateForm.get('nomEntreprise'); }
  get email()   { return this.updateForm.get('email'); }
  get mdp()     { return this.updateForm.get('mdp'); }
  get secteur() { return this.updateForm.get('secteur'); }
  get etat()    { return this.updateForm.get('etat'); }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.id || isNaN(this.id)) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'ID entreprise invalide'
      });
      this.router.navigate(['/listentreprise']); // fallback safe
      return;
    }

    this.crudService.getEntrepriseById(this.id).subscribe({
      next: (data: any) => {

  console.log("DATA RECEIVED:", data);

  this.updateForm.patchValue({
    nomEntreprise: data.nomEntreprise || '',
    email: data.email || '',
    secteur: data.secteur || '',
    etat: data.etat ?? true
  });

},
      error: (err) => {
        console.error('Erreur chargement entreprise:', err);
        Swal.fire({
          icon: 'error',
          title: 'Chargement échoué',
          text: 'Impossible de charger les informations de l’entreprise'
        });
        this.router.navigate(['/listentreprise']);
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
      nomEntreprise: values.nomEntreprise,
      email: values.email,
      secteur: values.secteur || null,
      etat: values.etat,
      ...(mdpToSend && { mdp: mdpToSend })
    };

    this.crudService.updateEntreprise(this.id, updatedData).subscribe({
      next: (response) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Mise à jour réussie',
          text: 'Les informations de l’entreprise ont été modifiées.',
          timer: 2200
        });
        this.router.navigate(['/listentreprise']); // ← go to this entreprise's profile
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
    this.router.navigate(['/listentreprise']);
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