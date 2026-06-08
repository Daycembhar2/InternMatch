import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AjouteradminComponent } from './ajouteradmin/ajouteradmin.component';
import { ListeadminComponent } from './listeadmin/listeadmin.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MenuComponent } from './menu/menu.component';
import { ListeEtudiantComponent } from './listeetudiant/listeetudiant.component';
import { AjouterutilisateurComponent } from './ajouterutilisateur/ajouterutilisateur.component';
import { AjouterEtudiantComponent } from './ajouteretudiant/ajouteretudiant.component';
import { AjouterentrepriseComponent } from './ajouterentreprise/ajouterentreprise.component';
import { AjouterinstitutionComponent } from './ajouterinstitution/ajouterinstitution.component';
import { ListentrepriseComponent } from './listentreprise/listentreprise.component';
import { ListinstitutionComponent } from './listinstitution/listinstitution.component';
import { ListCandidatComponent } from './listcandidat/listcandidat.component';
import { AjoutercandidatComponent } from './ajoutercandidat/ajoutercandidat.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { ModifieradminComponent } from './modifieradmin/modifieradmin.component';
import { HomeComponent } from './home/home.component';
import { ProfilComponent } from './profil/profil.component';
import { UpdateprofilComponent } from './updateprofil/updateprofil.component';
import { ResetpasswordWithTokenComponent } from './resetpasswordwithtoken/resetpasswordwithtoken.component';
import { UpdateEntrepriseComponent } from './updateentreprise/updateentreprise.component';
import { RegisterComponent } from './register/register.component';
import { UpdatestudentComponent } from './updatestudent/updatestudent.component';
import { UpdateInstitutionComponent } from './updateinstitution/updateinstitution.component';
import { ListcontactComponent } from './listcontact/listcontact.component';
import { ListoffresComponent } from './listoffres/listoffres.component';
import { UpdateOffreComponent } from './updateoffre/updateoffre.component';
import { UpdatecandidatComponent } from './updatecandidat/updatecandidat.component';
import { NgxPaginationModule } from 'ngx-pagination';
@NgModule({
  declarations: [
    AppComponent,
    AjouteradminComponent,
    ListeadminComponent,
    LoginComponent,
    HeaderComponent,
    FooterComponent,
    MenuComponent,
    ListeEtudiantComponent,
    AjouterutilisateurComponent,
    AjouterEtudiantComponent,
    AjouterentrepriseComponent,
    AjouterinstitutionComponent,
    ListentrepriseComponent,
    ListinstitutionComponent,
    ListCandidatComponent,
    AjoutercandidatComponent,
    ResetpasswordComponent,
    ModifieradminComponent,
    HomeComponent,
    ProfilComponent,
    UpdateprofilComponent,
    ResetpasswordWithTokenComponent,
    UpdateEntrepriseComponent,
    RegisterComponent,
    UpdatestudentComponent,
    UpdateInstitutionComponent,
    ListcontactComponent,
    ListoffresComponent,
    UpdateOffreComponent,
    UpdatecandidatComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule , ReactiveFormsModule , 
    NgxPaginationModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { } 

