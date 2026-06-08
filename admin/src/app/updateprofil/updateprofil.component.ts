import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Admin } from '../Entites/Admin.Entites';
import { CRUDService } from '../service/crud.service';

@Component({
  selector: 'app-updateprofil',
  templateUrl: './updateprofil.component.html',
  styleUrls: ['./updateprofil.component.css']
})
export class UpdateprofilComponent implements OnInit {
  adminDetails: any;
  updateadminForm: FormGroup;
  id: number;
  userDetails: any;
  isLoading: boolean = false;
  profileImagePreview: string | null = null;
  isSuperAdmin : boolean = false ;
  constructor(
    private fb: FormBuilder,
    private service: CRUDService,
    private route: Router,
    private router: ActivatedRoute,
  ) {
    this.userDetails = this.service.getUserDetails();
    // Initialisation du formulaire avec validation
    this.updateadminForm = this.fb.group({
      nom: ['', [
        Validators.required,
        Validators.pattern("[a-zA-Z .'-]+"),
        Validators.minLength(4),
      ]],
      prenom: ['', Validators.required],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      mdp: [''],
      role: ['', Validators.required],
    });

    // Chargement des infos actuelles de la admin de sport connectée
    this.adminDetails = this.service.getUserDetails();
  }

  // Getters pratiques pour le formulaire
  get nom() { return this.updateadminForm.get('nom'); }
  get prenom() { return this.updateadminForm.get('prenom'); }
  get email() { return this.updateadminForm.get('email'); }
  get mdp() { return this.updateadminForm.get('mdp'); }
  get role() { return this.updateadminForm.get('role'); }

  // Image preview handler
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  ngOnInit(): void {
    this.id = this.router.snapshot.params['id'];
   
  // ⭐ أول حاجة نعرفو شكون المستخدم المتصل
  const currentUser = this.service.getUserDetails();

  if(currentUser && currentUser.role){
    const role = currentUser.role.toLowerCase().trim();

    this.isSuperAdmin = (role === 'superadmin' || role === 'super admin');
  }

  // ⭐ بعد نجيب بيانات الأدمن اللي باش يتعدل
  this.service.getAdminById(this.id).subscribe((admin) => {

    if (admin) {
      this.adminDetails = admin;

      this.updateadminForm.patchValue({
        nom: admin.nom,
        prenom: admin.prenom,
        email: admin.email,
        mp: '',
        role: admin.role,
      });

      // ⭐ إذا موش super admin نسكرو role
      if(!this.isSuperAdmin){
        this.updateadminForm.get('role')?.disable();
      }
    }
  });
    // Chargement des données actuelles de la admin depuis l'API
    this.service.getAdminById(this.id).subscribe((admin) => {
      if (admin) {
        this.adminDetails = admin;

        this.updateadminForm.patchValue({
          nom: admin.nom,
          prenom: admin.prenom,
          email: admin.email,
          mdp: '',
          roleAdmin: admin.roleAdmin,
        });
      }
    });
  }
  updateadmin(): void {
    if (this.updateadminForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur de Validation',
        text: 'Veuillez remplir correctement tous les champs requis.',
        background: '#0f172a',
        color: '#e2e8f0',
        confirmButtonColor: '#1e3a8a'
      });
      return;
    }

    this.isLoading = true;
    const formData = this.updateadminForm.value;

    // Ne pas écraser le mot de passe s'il est vide dans le formulaire
    let motDePasse = formData.mdp;
    if (!motDePasse || motDePasse.trim() === '') {
      motDePasse = this.adminDetails.mdp;
    }

    const admin = new Admin(
      this.id,
      formData.nom,
      formData.prenom,
      formData.email,
      motDePasse,
      formData.roleAdmin,
    );

    this.service.updateAdmin(this.id, admin).subscribe({
      next: (res: any) => {
        console.log(res);

        localStorage.setItem("isadminIn", res.token);
        this.adminDetails = res.admin;

        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Votre profil a été modifié avec succès !',
          background: '#0f172a',
          color: '#e2e8f0',
          confirmButtonColor: '#1e3a8a'
        });

        this.isLoading = false;
        this.route.navigate(['/profiladmin']);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Échec de la mise à jour du profil. Veuillez réessayer.',
          background: '#0f172a',
          color: '#e2e8f0',
          confirmButtonColor: '#1e3a8a'
        });
      }
    });
  }

  cancelUpdate(): void {
    this.route.navigate(['/profiladmin']);
  }
}
