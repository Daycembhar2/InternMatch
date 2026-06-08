import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDService } from '../service/crud.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.css']
})
export class ResetpasswordComponent {

  resetForm: FormGroup;
  isLoading = false;          // ← mieux nommé que "loading"

  constructor(
    private fb: FormBuilder,
    private crudService: CRUDService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,                    // ← plus standard et plus tolérant
        // Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$') // si tu veux être strict
      ]]
    });
  }

  get emailControl() {
    return this.resetForm.get('email');
  }

  onSubmit() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched(); // montre toutes les erreurs
      Swal.fire({
        icon: 'warning',
        title: 'Champs invalides',
        text: 'Veuillez vérifier votre adresse email.',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.isLoading = true;

    const email = this.resetForm.value.email;

    this.crudService.forgotPassword(email).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Email envoyé !',
            html: '<p>Un lien de réinitialisation a été envoyé à votre adresse email.</p><p><strong>Vérifiez votre boîte de réception (et vos spams)</strong> et cliquez sur le lien fourni pour réinitialiser votre mot de passe.</p>',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            allowEscapeKey: false
          });

          this.resetForm.reset();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: response.message || 'Une erreur est survenue. Veuillez réessayer.',
            confirmButtonText: 'OK'
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erreur reset password:', err);

        let errorMsg = 'Une erreur serveur est survenue.';
        if (err.error?.message) {
          errorMsg = err.error.message;
        }

        Swal.fire({
          icon: 'error',
          title: 'Échec',
          text: errorMsg,
          confirmButtonText: 'OK'
        });
      }
    });
  }
}
