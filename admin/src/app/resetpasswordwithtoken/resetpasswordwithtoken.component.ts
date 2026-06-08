import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { CRUDService } from '../service/crud.service';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-resetpasswordwithtoken',
  templateUrl: './resetpasswordwithtoken.component.html',
  styleUrls: ['./resetpasswordwithtoken.component.css']
})
export class ResetpasswordWithTokenComponent implements OnInit {

  resetForm: FormGroup;
  isLoading = false;
  token: string = '';
  tokenValid = false;

  constructor(
    private fb: FormBuilder,
    private crudService: CRUDService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],
      confirmPassword: ['', [
        Validators.required,
        Validators.minLength(8)
      ]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Extraire le token de l'URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      console.log('[v0] Token reçu:', this.token);
      
      if (this.token) {
        this.tokenValid = true;
        console.log('[v0] Token valide pour reset password');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Lien invalide',
          text: 'Le lien de réinitialisation est invalide ou expiré.',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/forgotpassword']);
        });
      }
    });
  }

  // Validateur personnalisé pour vérifier que les deux mots de passe correspondent
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else if (confirmPassword?.errors?.['passwordMismatch']) {
      confirmPassword?.setErrors(null);
    }

    return null;
  }

  get newPasswordControl() {
    return this.resetForm.get('newPassword');
  }

  get confirmPasswordControl() {
    return this.resetForm.get('confirmPassword');
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

    console.log('[v0] Envoi du reset password avec token:', this.token);

    this.crudService.resetPassword(this.token, newPassword).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('[v0] Reset password réussi:', response);

        Swal.fire({
          icon: 'success',
          title: 'Mot de passe réinitialisé !',
          text: 'Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/']);
        });
      },
      error: (err : any) => {
        this.isLoading = false;
        console.error('[v0] Erreur reset password:', err);

        let errorMsg = 'Une erreur serveur est survenue.';
        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.status === 400) {
          errorMsg = 'Le token est expiré ou invalide.';
        }

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: errorMsg,
          confirmButtonText: 'Réessayer'
        });
      }
    });
  }
}
 
