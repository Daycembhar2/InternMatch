import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CRUDService } from '../service/crud.service';

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.css']
})
export class ResetpasswordComponent {
  resetForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private crudService: CRUDService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      role:  ['ETUDIANT', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get emailControl()  { return this.resetForm.get('email'); }
  get roleControl()   { return this.resetForm.get('role'); }

  onSubmit() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
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
    const role  = this.resetForm.value.role;

    this.crudService.forgotPassword(email, role).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Email envoyé !',
            html: '<p>Un lien de réinitialisation a été envoyé.</p><p><strong>Vérifiez votre boîte de réception et vos spams.</strong></p>',
            confirmButtonText: 'OK'
          });
          this.resetForm.reset({ role: 'ETUDIANT' });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: response.message || 'Une erreur est survenue.',
            confirmButtonText: 'OK'
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Échec',
          text: err.error?.message || 'Erreur serveur.',
          confirmButtonText: 'OK'
        });
      }
    });
  }
}