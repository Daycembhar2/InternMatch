import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CRUDService } from '../service/crud.service';  // adapte selon ton service

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']   // crée ce fichier si besoin
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private crudService: CRUDService   // ton service d'inscription
  ) {
    this.registerForm = this.fb.group({
      nom: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern("^[a-zA-ZÀ-ÿ\\s'-]+$")   // accepte accents et tirets
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)   // tu peux augmenter à 8 si tu veux
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void { }

  // Validateur cross-field : password doit correspondre à confirmPassword
  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword
      ? null
      : { passwordMismatch: true };
  }

  // Getters pour faciliter l'accès dans le template
  get nom()             { return this.registerForm.get('nom'); }
  get email()           { return this.registerForm.get('email'); }
  get password()        { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  register(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Formulaire incomplet',
        text: 'Veuillez remplir correctement tous les champs.',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.isLoading = true;

    const formData = {
      nom: this.registerForm.value.nom.trim(),
      email: this.registerForm.value.email.trim(),
      mdp: this.registerForm.value.password.trim(),
      // Ajoute role: 'candidat' ou 'entreprise' si nécessaire
      // role: 'candidat' par exemple
    };

    this.crudService.register(formData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Inscription réussie !',
          text: 'Votre compte a été créé. Vous pouvez maintenant vous connecter.',
          timer: 3000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/login']);   // ou '/signin' selon ton routing
        });
      },
      error: (err:any) => {
        this.isLoading = false;
        let errorMessage = 'Une erreur est survenue lors de l\'inscription.';
        
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 409) {   // conflit → email existe déjà souvent
          errorMessage = 'Cet email est déjà utilisé.';
        }

        Swal.fire({
          icon: 'error',
          title: 'Échec de l\'inscription',
          text: errorMessage,
          confirmButtonText: 'Réessayer'
        });
      }
    });
  }
}