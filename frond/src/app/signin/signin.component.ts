// signin.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CRUDService } from '../service/crud.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';
declare var google: any

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SignInComponent {
  messageCommande: string = '';
  signInForm: FormGroup;
  submitted = false;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private crudService: CRUDService,
    private router: Router,
    private authService: AuthenticationService
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
     mdp: ['', [
  Validators.required,
  Validators.minLength(8),
  Validators.pattern(/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/)
]],
      role: ['', Validators.required]
    });
  }

  get f() {
    return this.signInForm.controls;
  }

  login() {
    console.log('=== BOUTON SIGN IN CLIQUÉ ===');

    this.submitted = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.signInForm.invalid) {
      this.errorMessage = 'Veuillez remplir correctement email et mot de passe.';
      return;
    }

    this.isLoading = true;

    const loginData = {
      email: this.signInForm.value.email.trim(),
      mdp: this.signInForm.value.mdp
    };
    const role = this.signInForm.value.role;

    let endpoint = '';
    switch (role) {
      case 'ENTREPRISE':  endpoint = '/entreprise/login';  break;
      case 'ETUDIANT':    endpoint = '/etudiant/login';    break;
      case 'CANDIDAT':    endpoint = '/candidat/login';    break;
      case 'INSTITUTION': endpoint = '/institution/login'; break;
      default:
        console.error('Rôle de connexion non géré :', role);
        this.errorMessage = 'Rôle de connexion non géré.';
        this.isLoading = false;
        return;
    }

    this.crudService.login(endpoint, loginData).subscribe({
     next: (res: any) => {
  // Save token
  if (res.token) {
    localStorage.setItem('myToken', res.token);
  }

  // ✅ Save the role (was missing!)
  localStorage.setItem('userRole', role.toUpperCase());

  const userData = {
    token: res.token || '',
    user: {
      nom: res.nom,
      profilePic: res.photo || 'assets/images/user/default-avatar.png',
      role: role.toUpperCase()
    }
  };
  this.authService.login(userData);

  this.successMessage = 'Connexion réussie !';
  this.isLoading = false;

  switch (role) {
    case 'ETUDIANT':    this.router.navigate(['/etudiant/home']);    break;
    case 'ENTREPRISE':  this.router.navigate(['/entreprise/home']);  break;
    case 'CANDIDAT':    this.router.navigate(['/candidat/home']);    break;
    case 'INSTITUTION': this.router.navigate(['/institution/home']); break;
    default:            this.router.navigate(['/']);
  }
},
      error: (err: any) => {
        console.error('Erreur connexion :', err);
        this.errorMessage = err.message || 'Email ou mot de passe incorrect.';
        this.isLoading = false;
      }
    });
  }

 ngOnInit(): void {
  if (this.crudService.isLoggedIn()) {
    const user = this.crudService.userDetails();
    const role = user?.role?.toUpperCase() || localStorage.getItem('userRole');

    switch (role) {
      case 'ETUDIANT':    this.router.navigate(['/etudiant/home']); break;
      case 'ENTREPRISE':  this.router.navigate(['/entreprise/home']); break;
      case 'CANDIDAT':    this.router.navigate(['/candidat/home']); break;
      case 'INSTITUTION': this.router.navigate(['/institution/home']); break;
      default:            this.router.navigate(['/']); 
    }
    return;
  }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      google.accounts.id.initialize({
        client_id: '631910454382-ocomusshrvmo1fb4p1m04b7uisk9arnp.apps.googleusercontent.com',
        callback: this.handleCredentialResponse.bind(this)
      });
      google.accounts.id.renderButton(
        document.getElementById('g_id_signin'),
        { theme: 'outline', size: 'medium', shape: 'pill', text: 'continue_with' }
      );
      google.accounts.id.prompt();
    };
  }

  handleCredentialResponse(response: any): void {
  const idToken = response.credential;
  console.log("ID Token reçu :", idToken);

  this.crudService.signInWithGoogle(idToken).subscribe({
    next: (res: any) => {
      console.log('✅ Connexion Google réussie ! Réponse complète :', res);

      // === Sauvegarde obligatoire ===
      if (res.token) {
        localStorage.setItem('myToken', res.token);
        console.log('Token sauvegardé ✓');
      }

      // === Sauvegarde du rôle (le plus important pour toi) ===
      let userRole = '';

      if (res.user?.role) {
        userRole = res.user.role.toUpperCase();
      } else if (res.role) {
        userRole = res.role.toUpperCase();
      } else {
        // Si ton backend ne renvoie pas le rôle pour Google, on peut le forcer temporairement
        // (mais ce n'est pas idéal à long terme)
        userRole = 'ETUDIANT'; // ← change selon le test
        console.warn('Rôle non reçu du backend, utilisation valeur par défaut');
      }

      if (userRole) {
        localStorage.setItem('userRole', userRole);
        console.log('Rôle sauvegardé :', userRole);
      }

      // Option très recommandée : tout sauvegarder en JSON
      const userData = {
        token: res.token || '',
        user: res.user || { role: userRole },
        role: userRole
      };
      localStorage.setItem('user', JSON.stringify(userData));

      // Redirection + reload (pour recharger les guards/services)
      this.router.navigate(['']).then(() => {
        window.location.reload();
      });
    },
    error: (err: any) => {
      console.error('❌ Erreur connexion Google :', err);
      this.messageCommande = `
        <div class="alert alert-danger" role="alert">
          Erreur lors de la connexion avec Google. Veuillez réessayer.
        </div>`;
    }
  });
}
}