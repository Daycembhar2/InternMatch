import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CRUDService } from '../service/crud.service';
import { Contact } from '../Entites/Contact.Entites';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {

  contactForm: FormGroup;
  submitted = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isLoading = false;

  // ── IA ──
  iaLoading = false;
  messageAmeliore = '';

  constructor(
    private fb: FormBuilder,
    private crudService: CRUDService,
    private router  : Router
  ) {
    this.contactForm = this.fb.group({
      nom: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern("^[a-zA-ZÀ-ÿ\\s'-]+$")
      ]],
      email: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@gmail\\.com$')
      ]],
      subject: ['', [
        Validators.required,
        Validators.minLength(5)
      ]],
      comments: ['', [
        Validators.required,
        Validators.minLength(10)
      ]]
    });
  }

  ngOnInit(): void {}

  get f() { return this.contactForm.controls; }
  get nom() { return this.f['nom']; }
  get email() { return this.f['email']; }
  get subject() { return this.f['subject']; }
  get comments() { return this.f['comments']; }

  sendmessage() {
    this.submitted = true;
    this.successMessage = null;
    this.errorMessage = null;

    if (this.contactForm.invalid) {
      this.errorMessage = 'Veuillez remplir correctement tous les champs.';
      return;
    }

    this.isLoading = true;
    const formData = this.contactForm.value;

    this.crudService.addContact(new Contact(undefined, formData.nom, formData.email, formData.subject, formData.comments)).subscribe({
      next: (response: any) => {
        console.log('Succès :', response);
        this.successMessage = 'Votre message a été envoyé avec succès !';
        this.contactForm.reset();
        this.submitted = false;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur :', err);
        this.errorMessage = err.message || 'Erreur lors de l\'envoi du message.';
        this.isLoading = false;
      }
    });
  }

  // ── Méthodes IA ──
  ameliorerMessage(): void {
    const message = this.contactForm.get('comments')?.value;
    if (!message?.trim()) return;

    this.iaLoading = true;
    this.messageAmeliore = '';

    this.crudService.ameliorerTexte(message, 'message_contact').subscribe({
      next: (res) => {
        this.messageAmeliore = res.texte_ameliore;
        this.iaLoading = false;
      },
      error: () => {
        this.iaLoading = false;
        alert('Service IA indisponible. Réessayez.');
      }
    });
  }
//La réponse IA est stockée dans messageAmeliore et affichée avec un bouton "Utiliser cette version" qui patche le formulaire via patchValue().
  utiliserMessageIA(): void {
    this.contactForm.patchValue({ comments: this.messageAmeliore });
    this.messageAmeliore = '';
  }
  
  
    goToHome(): void {
      const user = this.crudService.userDetails();
      const role = (user?.role || '').toUpperCase().trim();
  
      switch (role) {
        case 'ETUDIANT':    this.router.navigate(['/etudiant/home']);    break;
        case 'CANDIDAT':    this.router.navigate(['/candidat/home']);    break;
        case 'ENTREPRISE':  this.router.navigate(['/entreprise/home']);  break;
        case 'INSTITUTION': this.router.navigate(['/institution/home']); break;
        default:            this.router.navigate(['/']);
      }
    }
}