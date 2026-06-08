import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CRUDService } from '../service/crud.service';
import { OffreService } from '../service/offre.service';
import { Offre } from '../Entites/Offre.Entites';

@Component({
  selector: 'app-postulation',
  templateUrl: './postulation.component.html',
  styleUrls: ['./postulation.component.css']
})
export class PostulationComponent implements OnInit {

  postuleForm: FormGroup;
  offre!: Offre | null;
  offreId!: number;
  selectedCvFile!: File;
  cvFileName: string = '';
  utilisateur: any = null;        // ← infos du compte connecté
  dejaPostule: boolean = false;   // ← vérification doublon

  isLoading = false;
  isImprovingLettre = false;
  lettreLength = 0;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private offreService: OffreService,
    private crudService: CRUDService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Seulement les 4 champs à saisir manuellement
    this.postuleForm = this.fb.group({
      telephone: ['', Validators.required],
      linkedin:  [''],
      cv:        [null, Validators.required],
      lettreMotivation: ['', [
        Validators.required,
        Validators.minLength(50),
        Validators.maxLength(1500)
      ]]
    });
  }

  ngOnInit(): void {
  this.offreId = Number(this.route.snapshot.paramMap.get('offreId'));
  if (this.offreId) this.chargerOffre();
  else this.errorMessage = "Aucune offre sélectionnée.";

  // 1. Récupérer les infos de base depuis le JWT
  const tokenData = this.crudService.userDetails();
  if (!tokenData) { this.router.navigate(['/login']); return; }

  const role = (tokenData.role || '').toUpperCase().trim();
  const userId = tokenData.id;

  const endpointMap: Record<string, string> = {
    'ETUDIANT': 'etudiant',
    'CANDIDAT': 'candidat'
  };

  const endpoint = endpointMap[role];

  // 2. Charger le profil complet depuis l'API (contient telephone à jour)
  if (endpoint && userId) {
    this.crudService.getById<any>(endpoint, userId).subscribe({
      next: (data) => {
        this.utilisateur = { ...data, role };
        // Pré-remplir le téléphone si disponible
        if (data.telephone) {
          this.postuleForm.patchValue({ telephone: data.telephone });
        }
      },
      error: () => {
        // Fallback sur le JWT si l'API échoue
        this.utilisateur = tokenData;
      }
    });
  } else {
    this.utilisateur = tokenData;
  }

  this.postuleForm.get('lettreMotivation')?.valueChanges.subscribe(value => {
    this.lettreLength = value ? value.length : 0;
  });
}

  chargerOffre(): void {
  this.offreService.getOffreById(this.offreId).subscribe({
    next: (data) => {
      console.log('🖼️ Image reçue :', data.image);  // ← ajoute cette ligne
      this.offre = data;
    },
    error: (err) => {
      console.error(err);
      this.errorMessage = "Impossible de charger l'offre.";
    }
  });
}

  onCvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.setCV(input.files[0]);
  }

  onCvDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.setCV(file);
  }

  setCV(file: File): void {
    if (file.type !== 'application/pdf') {
      Swal.fire({ icon: 'error', text: 'Seuls les fichiers PDF sont acceptés.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'error', text: 'Le CV ne doit pas dépasser 5 Mo.' });
      return;
    }
    this.selectedCvFile = file;
    this.cvFileName     = file.name;
    this.postuleForm.patchValue({ cv: file.name });
  }

  improveLettre(): void {
  const lettre = this.postuleForm.get('lettreMotivation')?.value;
  if (!lettre || lettre.length < 50) {
    Swal.fire({ icon: 'warning', text: "Écrivez au moins 50 caractères avant d'améliorer." });
    return;
  }

  this.isImprovingLettre = true;
  const original = lettre;

  this.crudService.ameliorerTexte(lettre, 'message_contact').subscribe({
    next: (res: any) => {
      this.isImprovingLettre = false;
      Swal.fire({
        title: 'Lettre améliorée ✨',
        html: `
          <div style="text-align: left;">
            <p><strong>Originale :</strong></p>
            <p style="background:#f8f9fa; padding:10px; border-left:3px solid #dc3545; white-space:pre-line;">${original}</p>
            <p><strong>Améliorée :</strong></p>
            <p style="background:#f8f9fa; padding:10px; border-left:3px solid #28a745; white-space:pre-line;">${res.texte_ameliore}</p>
          </div>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Utiliser la version améliorée',
        cancelButtonText: "Garder l'originale",
        confirmButtonColor: '#7c3aed',
        cancelButtonColor: '#6c757d'
      }).then((result) => {
        if (result.isConfirmed) {
          this.postuleForm.patchValue({ lettreMotivation: res.texte_ameliore });
          Swal.fire({ icon: 'success', title: 'Lettre mise à jour !', timer: 1500, showConfirmButton: false });
        }
      });
    },
    error: () => {
      this.isImprovingLettre = false;
      Swal.fire({ icon: 'error', text: "Service IA indisponible. Vérifiez que FastAPI tourne sur le port 8000." });
    }
  });
}

  sendCand(): void {
    if (this.postuleForm.invalid || !this.selectedCvFile) {
      this.postuleForm.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Formulaire incomplet',
        text: 'Veuillez remplir tous les champs obligatoires.'
      });
      return;
    }

    // Utiliser les infos déjà chargées dans ngOnInit
    const user = this.utilisateur;
    if (!user?.id) {
      Swal.fire({
        icon: 'error',
        title: 'Non connecté',
        text: 'Vous devez être connecté pour postuler.'
      }).then(() => this.router.navigate(['/login']));
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('cv',               this.selectedCvFile);
    formData.append('lettreMotivation', this.postuleForm.get('lettreMotivation')!.value);
    formData.append('telephone',        this.postuleForm.get('telephone')!.value);

    if (this.postuleForm.get('linkedin')?.value) {
      formData.append('linkedin', this.postuleForm.get('linkedin')!.value);
    }

    // Attacher l'ID selon le rôle — les autres infos sont en base via cet ID
    const role = (user.role || '').toUpperCase().trim();
    if (role === 'ETUDIANT') {
      formData.append('etudiantId', user.id.toString());
    } else if (role === 'CANDIDAT') {
      formData.append('candidatId', user.id.toString());
    } else {
      this.isLoading = false;
      Swal.fire({ icon: 'error', title: 'Rôle non reconnu' });
      return;
    }

    console.log('Rôle détecté :', role);
    formData.forEach((value, key) => console.log(key, '→', value));

    this.crudService.createPostulation(this.offreId, formData).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({ icon: 'success', title: 'Candidature envoyée !' })
          .then(() => this.router.navigate(['/mescandidatures']));
      },
      error: (err) => {
        console.error('Erreur POSTULATION :', err);
        this.isLoading = false;
        Swal.fire({ icon: 'error', title: "Erreur lors de l'envoi" });
      }
    });
  }

  get f() { return this.postuleForm.controls; }
  getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return 'assets/images/default-company.png'; // image par défaut
  if (imagePath.startsWith('http')) return imagePath; // déjà une URL complète
  return `http://localhost:8081/${imagePath}`; // adapter le port de ton backend
}
}