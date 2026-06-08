import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AjouteradminComponent } from './ajouteradmin/ajouteradmin.component';
import { ListeadminComponent } from './listeadmin/listeadmin.component';
import { LoginComponent } from './login/login.component';
import { ListeEtudiantComponent } from './listeetudiant/listeetudiant.component';
import { AjouterEtudiantComponent } from './ajouteretudiant/ajouteretudiant.component';
import { ListentrepriseComponent } from './listentreprise/listentreprise.component';
import { AjouterentrepriseComponent } from './ajouterentreprise/ajouterentreprise.component';
import { AjouterutilisateurComponent } from './ajouterutilisateur/ajouterutilisateur.component';
import { AuthGuard } from './service/auth.service';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { ModifieradminComponent } from './modifieradmin/modifieradmin.component';
import { HomeComponent } from './home/home.component';
import { ProfilComponent } from './profil/profil.component';
import { UpdateprofilComponent } from './updateprofil/updateprofil.component';
import { AjoutercandidatComponent } from './ajoutercandidat/ajoutercandidat.component';
import { ListCandidatComponent } from './listcandidat/listcandidat.component';
import { ResetpasswordWithTokenComponent } from './resetpasswordwithtoken/resetpasswordwithtoken.component';
import { UpdateEntrepriseComponent } from './updateentreprise/updateentreprise.component';
import { RegisterComponent } from './register/register.component';
import { ListinstitutionComponent } from './listinstitution/listinstitution.component';
import { UpdateInstitutionComponent } from './updateinstitution/updateinstitution.component';
import { ListcontactComponent } from './listcontact/listcontact.component';
import { ListoffresComponent } from './listoffres/listoffres.component';
import { UpdateOffreComponent } from './updateoffre/updateoffre.component';
import { UpdatestudentComponent } from './updatestudent/updatestudent.component';

const routes: Routes = [{path:'listeadmin',component:ListeadminComponent,canActivate:[AuthGuard]},
{path:'',component:LoginComponent},
{path:'ajouteradmin',component:AjouteradminComponent},
{path:'listeetudiant',component:ListeEtudiantComponent,canActivate:[AuthGuard]},
{path:'ajouteretudiant',component:AjouterEtudiantComponent,canActivate:[AuthGuard]},
{path:'listentreprise',component:ListentrepriseComponent,canActivate:[AuthGuard]},
{path:'ajouterentreprise',component:AjouterentrepriseComponent,canActivate:[AuthGuard]},
{path:'ajouterutilisateur',component:AjouterutilisateurComponent,canActivate:[AuthGuard]},
{path:'forgotpassword',component:ResetpasswordComponent},
{path:'modifieradmin/:id',component:ModifieradminComponent,canActivate:[AuthGuard]},
{path:'home',component:HomeComponent,canActivate:[AuthGuard]},
{path:'profil/:id',component:ProfilComponent,canActivate:[AuthGuard]},
{path:'ajoutercandidat',component:AjoutercandidatComponent,canActivate:[AuthGuard]},
{path:'listcandidat',component:ListCandidatComponent,canActivate:[AuthGuard]},
{path:'ajouteretudiant',component:AjouterEtudiantComponent,canActivate:[AuthGuard]},
{path:'resetpassword',component:ResetpasswordWithTokenComponent},
{path:'updateprofil/:id',component:UpdateprofilComponent},
{path:'updateentreprise/:id',component:UpdateEntrepriseComponent,canActivate:[AuthGuard]},
{path:'listinstitution',component:ListinstitutionComponent,canActivate:[AuthGuard]},
{path:'updateinstitution/:id',component:UpdateInstitutionComponent,canActivate:[AuthGuard]},
{path:'listinstitution',component:ListinstitutionComponent,canActivate:[AuthGuard]},
{path:'listcontact',component:ListcontactComponent,canActivate:[AuthGuard]},
{path:'register',component:RegisterComponent},
{path:'listoffres',component:ListoffresComponent,canActivate:[AuthGuard]},
{path:'updateoffre/:id',component:UpdateOffreComponent,canActivate:[AuthGuard]},
{path:'updatestudent/:id',component:UpdatestudentComponent,canActivate:[AuthGuard]}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
