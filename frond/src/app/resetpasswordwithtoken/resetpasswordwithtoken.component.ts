import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { CRUDService } from '../service/crud.service';
import { AbstractControl, FormBuilder, FormGroup,
         ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-resetpasswordwithtoken',
  templateUrl: './resetpasswordwithtoken.component.html',
  styleUrls: ['./resetpasswordwithtoken.component.css']
})
export class ResetpasswordWithTokenComponent implements OnInit {

  resetForm: FormGroup;
  isLoading  = false;
  token      = '';
  tokenValid = false;

  constructor(
    private fb: FormBuilder,
    private crudService: CRUDService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      newPassword:     ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        this.tokenValid = true;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Lien invalide',
          text: 'Le lien de réinitialisation est invalide ou expiré.',
          confirmButtonText: 'OK'
        }).then(() => this.router.navigate(['/resetpassword']));
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPwd     = control.get('newPassword');
    const confirmPwd = control.get('confirmPassword');
    if (newPwd && confirmPwd && newPwd.value !== confirmPwd.value) {
      confirmPwd.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    if (confirmPwd?.errors?.['passwordMismatch']) {
      confirmPwd.setErrors(null);
    }
    return null;
  }

  get newPasswordControl()     { return this.resetForm.get('newPassword'); }
  get confirmPasswordControl() { return this.resetForm.get('confirmPassword'); }

  // Extrait le rôle depuis le token JWT
  private getRoleFromToken(token: string): string {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      console.log('Payload reset token:', payload);
      // Structure attendue: { sub: "email", purpose: "password_reset", role: "etudiant" }

      const role = (payload?.role || 'etudiant').toLowerCase();

      const validRoles = ['etudiant', 'entreprise', 'institution', 'candidat'];
      if (!validRoles.includes(role)) {
        console.warn(`Rôle invalide: "${role}" → fallback etudiant`);
        return 'etudiant';
      }

      return role;
    } catch (e) {
      console.error('Erreur décodage token reset', e);
      return 'etudiant';
    }
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.token) {
      this.resetForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Champs invalides',
        text: 'Veuillez vérifier les mots de passe.',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.isLoading = true;
    const newPassword = this.resetForm.value.newPassword;
    const role        = this.getRoleFromToken(this.token);

    console.log('Rôle extrait du token:', role);

    this.crudService.resetPassword(this.token, newPassword, role).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Mot de passe réinitialisé !',
          text: 'Votre mot de passe a été mis à jour. Vous pouvez vous connecter.',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => this.router.navigate(['/signin']));
      },
      error: (err: any) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err.error?.message ?? (err.status === 400
            ? 'Le token est expiré ou invalide.'
            : 'Erreur serveur.'),
          confirmButtonText: 'Réessayer'
        });
      }
    });
  }
}