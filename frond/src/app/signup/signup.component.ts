import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDService } from '../service/crud.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignUpComponent implements OnInit {

  signUpForm!: FormGroup;
  step = 1;
  selectedRole: string | null = null;
  isLoading = false;           // ← added
  errorMessage: string | null = null;
  showEmailAlert = false;
registeredEmail = '';
  // Helper getter (very common pattern)
  get f() {
    return this.signUpForm.controls;
  }

  constructor(
    private fb: FormBuilder,
    private crudService: CRUDService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      prenom: ['', Validators.required],
      nom:     ['', Validators.required],
      email:   ['', [Validators.required, Validators.email]],
      mdp: ['', [
  Validators.required,
  Validators.minLength(8),
  Validators.pattern(/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/)
]],
      role:    ['', Validators.required],

      // Dynamic fields
      niveau:        [''],
      faculte:       [''],
      competences:   [''],
      nomEntreprise: [''],
      nomInstitution:    [''],
      secteur:        [''],
      telephone:      [''],
      domaineRecherche: [''],
      typeInstitution: [''],
      institution:      [''] // Hidden field to store selected institution ID
    });
  }

  selectedRoleCard: string | null = null; // ← ajoute cette propriété

selectRole(role: string) {
  this.selectedRoleCard = role; // ← mémorise la carte active
  this.selectedRole = role;
  this.signUpForm.patchValue({ role });
  // Petit délai pour que l'animation de sélection soit visible avant step 2
  setTimeout(() => { this.step = 2; }, 220);
}

  goBack() {
    this.step = 1;
    this.selectedRole = null;
    this.signUpForm.patchValue({ role: '' });
  }

  getMailtoLink(): string {
    const domain = this.registeredEmail.split('@')[1];
    const webmailMap: { [key: string]: string } = {
      'gmail.com':   'https://mail.google.com',
      'outlook.com': 'https://outlook.live.com',
      'hotmail.com': 'https://outlook.live.com',
      'yahoo.com':   'https://mail.yahoo.com',
      'yahoo.fr':    'https://mail.yahoo.com',
    };
    return webmailMap[domain] || `mailto:${this.registeredEmail}`;
  }
addUser(formValue: any) {
  if (this.signUpForm.invalid) {
  this.signUpForm.markAllAsTouched();
  this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
  return;
}
if (!this.selectedRole) {
  this.errorMessage = 'Veuillez choisir un rôle.';
  return;
}
  this.isLoading = true;
  this.errorMessage = '';

  const payload: any = {
    nom: formValue.nom,
    prenom: formValue.prenom,
    email: formValue.email,
    mdp: formValue.mdp,
    role: this.selectedRole?.toUpperCase(),
    telephone: formValue.telephone 
  };

  if (this.selectedRole === 'ETUDIANT') {
    if (formValue.niveau) payload.niveau = formValue.niveau;
    if (formValue.faculte) payload.faculte = formValue.faculte;
      if (this.selectedInstitution?.id) {
    payload.institutionId = this.selectedInstitution.id;
  } 
  if (this.selectedEncadrant) payload.encadrantChoisi = this.selectedEncadrant;
// Le statut sera mis à EN_ATTENTE côté backend lors de la sauvegarde
  } else if (this.selectedRole === 'ENTREPRISE') {
    if (formValue.nomEntreprise) payload.nomEntreprise = formValue.nomEntreprise;
    if (formValue.secteur) payload.secteur = formValue.secteur;
  } else if (this.selectedRole === 'INSTITUTION') {
      if (formValue.nomInstitution) payload.nomFaculte = formValue.nomInstitution;
    if (formValue.domaineRecherche) payload.domaineRecherche = formValue.domaineRecherche;
    if (formValue.typeInstitution) payload.typeInstitution = formValue.typeInstitution;
 } else if (this.selectedRole === 'CANDIDAT') {
    if (formValue.competences)    payload.competences    = formValue.competences;     
    if (formValue.secteur) payload.secteur = formValue.secteur; 
}

  // Le role dans l'URL doit être en minuscules
  const endpoint = (this.selectedRole ?? '').toLowerCase();

  console.log('Signup payload:', endpoint, payload);

 // APRÈS — utilise addUser() qui préserve err.status
this.crudService.addUser(payload)
  .subscribe({
    next: (res: any) => {
      this.isLoading = false;
      if (this.selectedRole === 'INSTITUTION' || this.selectedRole === 'ENTREPRISE') {
        Swal.fire({
          icon: 'success',
          title: 'Compte créé !',
          text: 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
          timer: 2500,
          showConfirmButton: false
        }).then(() => this.router.navigate(['/signin']));
      } else {
        this.registeredEmail = formValue.email;
        this.showEmailAlert = true;
      }
    },
    error: (err: any) => {
      this.isLoading = false;
      console.error('Erreur inscription:', err);

      if (err.status === 409) {
        this.errorMessage = 'Cet email est déjà utilisé. Essayez de vous connecter.';
      } else {
        this.errorMessage = "Une erreur est survenue lors de l'inscription.";
      }
    }
  });
}
institutionsSuggestions: any[] = [];
selectedInstitution: any = null;

searchInstitutions(event: any): void {
  const nom = event.target.value?.trim();
  this.selectedInstitution = null; // reset si on retape
  if (!nom || nom.length < 2) {
    this.institutionsSuggestions = [];
    return;
  }
  this.crudService.getAll<any>(`institution/search?nom=${encodeURIComponent(nom)}`)
    .subscribe({
      next: (data) => this.institutionsSuggestions = data,
      error: () => this.institutionsSuggestions = []
    });
}

selectInstitution(inst: any): void {
  this.selectedInstitution      = inst;
  this.institutionsSuggestions  = [];
}
addRipple(event: MouseEvent, cardEl: HTMLElement): void {
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const rect = cardEl.getBoundingClientRect();
  ripple.style.left = (event.clientX - rect.left - 24) + 'px';
  ripple.style.top  = (event.clientY - rect.top  - 24) + 'px';
  cardEl.appendChild(ripple);
  setTimeout(() => ripple.remove(), 2000);
}
encadrantsSuggestions: string[] = [];
selectedEncadrant: string | null = null;

// Appelé quand l'étudiant saisit sa faculté
onFaculteChange(event: any): void {
    const faculte = event.target.value?.trim();
    if (!faculte || faculte.length < 2) { this.encadrantsSuggestions = []; return; }

    // Chercher l'institution correspondante et récupérer ses encadrants
    this.crudService.getAll<any>(`institution/search?nom=${encodeURIComponent(faculte)}`)
        .subscribe({
            next: (institutions) => {
                if (institutions.length > 0) {
                    const instId = institutions[0].id;
                    this.crudService.getAll<string>(`institution/${instId}/encadrants`)
    .subscribe({ next: (enc) => this.encadrantsSuggestions = enc });
                }
            }
        });
}

selectEncadrant(enc: string): void {
    this.selectedEncadrant = enc;
}
}