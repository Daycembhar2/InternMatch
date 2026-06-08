import { Component, OnInit } from '@angular/core';
import { CRUDService } from '../service/crud.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Offre } from '../Entites/Offre.Entites';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { OffreService } from '../service/offre.service';

@Component({
  selector: 'app-offer-form',
  templateUrl: './offer-form.component.html',
  styleUrls: ['./offer-form.component.css']
})
export class OfferFormComponent implements OnInit {  // ← ajouter OnInit

  offreForm: FormGroup;
  selectedFile!: File;
  isLoading = false;
  isImprovingDescription = false;
  descriptionImproved = false;
  originalDescription = '';
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // ✅ Nouveau : mode édition
  isEditMode = false;
  offreId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private offreService: OffreService,
    private service: CRUDService,
    private router: Router,
    private route: ActivatedRoute  // ← injecter ActivatedRoute
  ) {
    this.offreForm = this.fb.group({
      titre:          new FormControl('', [Validators.required, Validators.minLength(3)]),
      description:    new FormControl('', [Validators.required, Validators.minLength(10)]),
      type:           new FormControl('', [Validators.required]),
      dateExpiration: new FormControl('', [Validators.required]),
      time:           new FormControl('', [Validators.required]),
      image:          [''],
      localisation:   new FormControl(''),
      secteur:        new FormControl(''),
      autreSecteur:   new FormControl('')
    });
  }

  // ✅ Nouveau : ngOnInit pour lire le queryParam ?id=
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.offreId = +id;
        this.chargerOffre(this.offreId);
      }
    });
  }

  // ✅ Nouveau : charger l'offre et pré-remplir le formulaire
  chargerOffre(id: number): void {
    this.isLoading = true;
    this.offreService.getOffreById(id).subscribe({
      next: (offre: any) => {
        this.isLoading = false;

        // Détecter si le secteur est une valeur custom (Autres)
        const secteursStandards = [
          'Développement', 'Marketing', 'Design', 'Data', 'Finance', 'Santé et médical', 'Autres'
        ];
        const isAutreSecteur = offre.secteur && !secteursStandards.includes(offre.secteur);

        // Formater la date en yyyy-MM-dd pour l'input[type=date]
        const dateExp = offre.dateExpiration
          ? new Date(offre.dateExpiration).toISOString().split('T')[0]
          : '';

        this.offreForm.patchValue({
          titre:          offre.titre,
          description:    offre.description,
          type:           offre.type,
          dateExpiration: dateExp,
          time:           offre.time,
          localisation:   offre.localisation,
          secteur:        isAutreSecteur ? 'Autres' : offre.secteur,
          autreSecteur:   isAutreSecteur ? offre.secteur : ''
        });

        if (isAutreSecteur) {
          this.offreForm.get('autreSecteur')?.setValidators([Validators.required]);
          this.offreForm.get('autreSecteur')?.updateValueAndValidity();
        }
      },
      error: () => {
        this.isLoading = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de charger l\'offre.' });
        this.router.navigate(['/entreprise/offres']);
      }
    });
  }

  // ─── Getters ───────────────────────────────────────────────
  get titre()         { return this.offreForm.get('titre'); }
  get description()   { return this.offreForm.get('description'); }
  get type()          { return this.offreForm.get('type'); }
  get dateExpiration(){ return this.offreForm.get('dateExpiration'); }
  get time()          { return this.offreForm.get('time'); }
  get image()         { return this.offreForm.get('image'); }

  // ─── Sélection fichier ─────────────────────────────────────
  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.selectedFile = file;
    if (file) {
      this.offreForm.patchValue({ image: file });
      this.offreForm.get('image')?.updateValueAndValidity();
    }
  }

  getErrorMessage(control: any, fieldName: string): string {
    if (control.hasError('required'))  return `Le champ ${fieldName} est obligatoire`;
    if (control.hasError('minlength')) return `Le champ ${fieldName} doit contenir au moins ${control.errors.minlength.requiredLength} caractères`;
    return '';
  }

  improveDescription() {
    if (!this.description?.value?.trim()) {
      Swal.fire({ icon: 'warning', title: 'Attention', text: 'Veuillez écrire une description avant d\'améliorer.' });
      return;
    }
    this.isImprovingDescription = true;
    this.originalDescription = this.description?.value;
    this.service.ameliorerTexte(this.description?.value, 'description_offre').subscribe({
      next: (res: any) => {
        this.isImprovingDescription = false;
        Swal.fire({
          title: 'Description améliorée ✨',
          html: `<div style="text-align:left;">
            <p><strong>Originale :</strong></p>
            <p style="background:#f8f9fa;padding:10px;border-left:3px solid #dc3545;">${this.originalDescription}</p>
            <p><strong>Améliorée :</strong></p>
            <p style="background:#f8f9fa;padding:10px;border-left:3px solid #28a745;white-space:pre-line;">${res.texte_ameliore}</p>
          </div>`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Utiliser la version améliorée',
          cancelButtonText: 'Garder l\'originale',
          confirmButtonColor: '#7c3aed'
        }).then(result => {
          if (result.isConfirmed) {
            this.offreForm.patchValue({ description: res.texte_ameliore });
            this.descriptionImproved = true;
          }
        });
      },
      error: () => {
        this.isImprovingDescription = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Service IA indisponible.' });
      }
    });
  }

  resetDescription() {
    if (this.originalDescription && this.descriptionImproved) {
      Swal.fire({
        title: 'Réinitialiser ?', icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Oui', cancelButtonText: 'Annuler'
      }).then(result => {
        if (result.isConfirmed) {
          this.offreForm.patchValue({ description: this.originalDescription });
          this.descriptionImproved = false;
        }
      });
    }
  }

  // ✅ sendOffre : créer OU mettre à jour selon le mode
  sendOffre() {
    // En mode édition, l'image n'est pas obligatoire
    if (this.offreForm.invalid || (!this.isEditMode && !this.selectedFile)) {
      this.offreForm.markAllAsTouched();
      Swal.fire({ icon: 'error', title: 'Formulaire incomplet', text: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }

    const userDetails = this.service.userDetails();
    if (!userDetails?.id) {
      Swal.fire({ icon: 'error', title: 'Erreur', text: 'Utilisateur non connecté.' });
      return;
    }

    const secteurValue     = this.offreForm.get('secteur')?.value;
    const autreSecteurValue = this.offreForm.get('autreSecteur')?.value?.trim();
    const secteurFinal     = secteurValue === 'Autres' && autreSecteurValue ? autreSecteurValue : secteurValue;

    const formData = new FormData();
    formData.append('titre',          this.offreForm.get('titre')?.value);
    formData.append('description',    this.offreForm.get('description')?.value);
    formData.append('type',           this.offreForm.get('type')?.value);
    formData.append('dateExpiration', this.offreForm.get('dateExpiration')?.value);
    formData.append('time',           this.offreForm.get('time')?.value);
    formData.append('localisation',   this.offreForm.get('localisation')?.value ?? '');
    formData.append('secteur',        secteurFinal ?? '');
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    this.isLoading = true;

    // ✅ Branchement création / modification
    if (this.isEditMode && this.offreId) {
      this.offreService.updateOffre(this.offreId, formData).subscribe({
        next: () => {
          this.isLoading = false;
          Swal.fire({ icon: 'success', title: 'Modifiée !', text: 'Offre mise à jour.', timer: 1500, showConfirmButton: false })
            .then(() => this.router.navigate(['/entreprise/offres']));
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Modification échouée.' });
        }
      });
    } else {
      formData.append('datePublication', new Date().toISOString().split('T')[0]);
      this.offreService.createOffre(userDetails.id, formData).subscribe({
        next: () => {
          this.isLoading = false;
          Swal.fire({ icon: 'success', title: 'Publiée !', timer: 1500, showConfirmButton: false })
            .then(() => this.router.navigate(['/entreprise/offres']));
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Offre non ajoutée.' });
        }
      });
    }
  }

  onSecteurChange(event: any) {
    const value = event.target.value;
    if (value === 'Autres') {
      this.offreForm.get('autreSecteur')?.setValidators([Validators.required]);
    } else {
      this.offreForm.get('autreSecteur')?.clearValidators();
      this.offreForm.get('autreSecteur')?.setValue('');
    }
    this.offreForm.get('autreSecteur')?.updateValueAndValidity();
  }
}