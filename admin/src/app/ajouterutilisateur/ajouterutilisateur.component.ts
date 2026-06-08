import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CRUDService } from '../service/crud.service';
import { Admin } from '../Entites/Admin.Entites';
import { Etudiant } from '../Entites/Etudiant.Entites';
import { Entreprise } from '../Entites/Entreprise.Entites';
import { Institution } from '../Entites/Institution.Entites';
import { Candidat } from '../Entites/Candidat.Entites';

@Component({
  selector: 'app-ajouterutilisateur',
  templateUrl: './ajouterutilisateur.component.html',
  styleUrls: ['./ajouterutilisateur.component.css']
})
export class AjouterutilisateurComponent implements OnInit {

  utilisateurForm: FormGroup;
  selectedRole: string = '';
  roles = ['Etudiant', 'Candidat', 'Entreprise', 'Institution', 'Admin'];

  constructor(
    private crudService: CRUDService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.utilisateurForm = this.createForm();
  }

 listeInstitutions: any[] = [];

ngOnInit(): void {
  this.setupFormListeners();
  // ✅ Charger les institutions pour le select
  this.crudService.getAllInstitutions().subscribe({
    next: (data) => this.listeInstitutions = data,
    error: () => console.error('Impossible de charger les institutions')
  });
}

  createForm(): FormGroup {
    return this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3), Validators.pattern("^[a-zA-ZÀ-ÿ\\s'-]+$")]],
      prenom: ['', [Validators.required, Validators.minLength(3), Validators.pattern("^[a-zA-ZÀ-ÿ\\s'-]+$")]],
      email: ['', [Validators.required, Validators.email]],
      mdp: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],

      // Étudiant
      niveau: [''],
      specialite: [''],
      faculte: [''],
      institutionId: [''],   // ID de l'institution liée
      etat: [true],   

      // Candidat
      competences: [''],
      cvCandidat: [''],

      // Entreprise
      nomEntreprise: [''],
      secteur: [''],

      // Institution
      nomFaculte: [''],

      // Admin
      roleAdmin: ['']
    });
  }

  setupFormListeners(): void {
    this.utilisateurForm.get('role')?.valueChanges.subscribe(role => {
      this.selectedRole = role || '';
      this.updateValidators(role || '');
    });
  }

  updateValidators(role: string): void {
    const requiredIf = (condition: boolean) => condition ? Validators.required : null;

    const champs = {
      niveau: requiredIf(role === 'Etudiant'),
      specialite: requiredIf(role === 'Etudiant'),
      faculte: requiredIf(role === 'Etudiant'),
      cvEtudiant: requiredIf(role === 'Etudiant'),

      competences: requiredIf(role === 'Candidat'),
      cvCandidat: requiredIf(role === 'Candidat'),

      nomEntreprise: requiredIf(role === 'Entreprise'),
      secteur: requiredIf(role === 'Entreprise'),

      nomFaculte: requiredIf(role === 'Institution'),

      roleAdmin: requiredIf(role === 'Admin')
    };

    Object.entries(champs).forEach(([key, validator]) => {
      const control = this.utilisateurForm.get(key);
      if (control) {
        control.setValidators(validator);
        control.updateValueAndValidity();
      }
    });
  }

  // Getters publics pour le template
  get nom()          { return this.utilisateurForm.get('nom'); }
  get prenom()       { return this.utilisateurForm.get('prenom'); }
  get email()        { return this.utilisateurForm.get('email'); }
  get mdp()          { return this.utilisateurForm.get('mdp'); }
  get role()         { return this.utilisateurForm.get('role'); }

  get niveau()       { return this.utilisateurForm.get('niveau'); }
  get specialite()   { return this.utilisateurForm.get('specialite'); }
  get faculte()      { return this.utilisateurForm.get('faculte'); }
  get cvEtudiant()   { return this.utilisateurForm.get('cvEtudiant'); }

  get competences()  { return this.utilisateurForm.get('competences'); }
  get cvCandidat()   { return this.utilisateurForm.get('cvCandidat'); }

  get nomEntreprise(){ return this.utilisateurForm.get('nomEntreprise'); }
  get secteur()      { return this.utilisateurForm.get('secteur'); }

  get nomFaculte()   { return this.utilisateurForm.get('nomFaculte'); }

  get roleAdmin()    { return this.utilisateurForm.get('roleAdmin'); }

  addUtilisateur(): void {
    if (this.utilisateurForm.invalid) {
      this.utilisateurForm.markAllAsTouched();
      Swal.fire('Attention', 'Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    const formValue = this.utilisateurForm.value;
    const role = formValue.role;

    let entity: any;
    let addObservable: any;

    switch (role) {
      case 'Admin':
        entity = new Admin();
        entity.nom = formValue.nom;
        entity.prenom = formValue.prenom;
        entity.email = formValue.email;
        entity.mdp = formValue.mdp;
        entity.role = 'Admin';
        entity.roleAdmin = formValue.roleAdmin;
        addObservable = this.crudService.addAdmin(entity);
        break;

    case 'Etudiant':
  entity = new Etudiant();
  entity.nom          = formValue.nom;
  entity.prenom       = formValue.prenom;
  entity.email        = formValue.email;
  entity.mdp          = formValue.mdp;
  entity.role         = 'Etudiant';
  entity.niveau       = formValue.niveau;
  entity.specialite   = formValue.specialite;
  entity.faculte      = formValue.faculte;
  entity.etat         = true;                    // ✅ actif par défaut
  // institutionId envoyé séparément si besoin
  addObservable = this.crudService.addEtudiant(entity);
  break;
        entity = new Etudiant();
        entity.nom = formValue.nom;
        entity.prenom = formValue.prenom;
        entity.email = formValue.email;
        entity.mdp = formValue.mdp;
        entity.role = 'Etudiant';
        entity.niveau = formValue.niveau;
        entity.specialite = formValue.specialite;
        entity.faculte = formValue.faculte;
        entity.cv = formValue.cvEtudiant;
        addObservable = this.crudService.addEtudiant(entity);
        break;

      case 'Entreprise':
        entity = new Entreprise();
        entity.nom = formValue.nom;
        entity.prenom = formValue.prenom;
        entity.email = formValue.email;
        entity.mdp = formValue.mdp;
        entity.role = 'Entreprise';
        entity.nomEntreprise = formValue.nomEntreprise;
        entity.secteur = formValue.secteur;
        addObservable = this.crudService.addEntreprise(entity);
        break;

      case 'Institution':
        entity = new Institution();
        entity.nom = formValue.nom;
        entity.prenom = formValue.prenom;
        entity.email = formValue.email;
        entity.mdp = formValue.mdp;
        entity.role = 'Institution';
        entity.nomFaculte = formValue.nomFaculte;
        addObservable = this.crudService.addInstitution(entity);
        break;

      case 'Candidat':
       entity = new Candidat();
  entity.nom = formValue.nom;
  entity.prenom = formValue.prenom;
  entity.email = formValue.email;
  entity.mdp = formValue.mdp;
  entity.role = 'Candidat';
  entity.competences = formValue.competences;
  entity.cv = formValue.cvCandidat;

  addObservable = this.crudService.addCandidat(entity);
  break;

      default:
        Swal.fire('Erreur', 'Rôle non reconnu', 'error');
        return;
    }

    addObservable.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Utilisateur ajouté avec succès !',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/home']).then(() => window.location.reload());
          // bech naamlou rechargement d'un etudiant k nzydou wehed jdid 
          this.crudService.refreshEtudiants();
        });
      },
     error: (err: any) => {
  console.error('Erreur ajout :', err);
  let msg = 'Une erreur est survenue lors de l\'ajout';

  if (err.status === 0) {
    msg = 'Erreur CORS : impossible de contacter le serveur. Vérifiez que le backend est lancé et que CORS est activé.';
  } else if (err.status === 404) {
    msg = 'Endpoint non trouvé. Vérifiez l\'URL du rôle sélectionné.';
  } else if (err.status === 500) {
    msg = 'Erreur serveur : ' + (err.error?.message || 'détails inconnus');
  }

  Swal.fire({
    icon: 'error',
    title: 'Erreur',
    text: msg
  });
}});
  }

  shouldShowField(fieldName: string): boolean {
    const role = this.selectedRole;
    if (['niveau', 'specialite', 'faculte', 'cvEtudiant'].includes(fieldName)) return role === 'Etudiant';
    if (['competences', 'cvCandidat'].includes(fieldName)) return role === 'Candidat';
    if (['nomEntreprise', 'secteur'].includes(fieldName)) return role === 'Entreprise';
    if (fieldName === 'nomFaculte') return role === 'Institution';
    if (fieldName === 'roleAdmin') return role === 'Admin';
    return false;
  }

  getErrorMessage(control: any, fieldName: string): string {
    if (!control) return '';

    if (control.hasError('required')) return `Le champ ${fieldName} est obligatoire`;
    if (control.hasError('minlength')) {
      return `Le champ ${fieldName} doit contenir au moins ${control.errors.minlength.requiredLength} caractères`;
    }
    if (control.hasError('email')) return `L'email n'est pas valide`;
    if (control.hasError('pattern')) return `Format invalide pour ${fieldName}`;
    return '';
  }
}