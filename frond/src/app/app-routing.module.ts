import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ContactComponent } from './contact/contact.component';
import { SignUpComponent } from './signup/signup.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { SignInComponent } from './signin/signin.component';
import { SignoutComponent } from './signout/signout.component';
import { ServicesComponent } from './services/services.component';
import { PravicypageComponent } from './pravicypage/pravicypage.component';
import { ProfileComponent } from './profile/profile.component';
import { EtudianthomeComponent } from './etudianthome/etudianthome.component';
import { EntreprisehomeComponent } from './entreprisehome/entreprisehome.component';
import { ListeOffresComponent } from './liste-offres/liste-offres.component';
import { OfferFormComponent } from './offer-form/offer-form.component';
import { PostulationComponent } from './postulation/postulation.component';
import { CandidathomeComponent } from './candidathome/candidathome.component';
import { EntrepriseoffresComponent } from './entrepriseoffres/entrepriseoffres.component';
import { MescandidaturesComponent } from './mescandidatures/mescandidatures.component';
import { AuthGuard } from './service/auth.service';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { ResetpasswordWithTokenComponent } from './resetpasswordwithtoken/resetpasswordwithtoken.component';
import { InstitutionhomeComponent } from './institutionhome/institutionhome.component';
import { OffredetailsComponent } from './offredetails/offredetails.component';
import { PaiementComponent } from './paiement/paiement.component';


const routes: Routes = [
  {path:'signout',component:SignoutComponent},
  {path:'signin',component:SignInComponent},
  {path:'', component:HomeComponent},
  {path:'contact', component:ContactComponent},
  {path:'signup',component:SignUpComponent},
  {path:'aboutus',component:AboutusComponent},
  {path:'contact',component:ContactComponent},
  {path:'services',component:ServicesComponent},
  {path:'privacy',component:PravicypageComponent},
  {path:'profile',component:ProfileComponent},
   {
    path: 'etudiant/home',
    component: EtudianthomeComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ETUDIANT'] }
  },
  {path:'entreprise/home', component:EntreprisehomeComponent},
  
  {path:'listoffres',component:ListeOffresComponent},
 {
    path: 'entreprise/offreForm',
    component: OfferFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ENTREPRISE'] }
  },
   {
    path: 'postulation/:offreId',
    component: PostulationComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ETUDIANT', 'CANDIDAT'] }
  },
  {path: 'candidat/home',component: CandidathomeComponent,canActivate: [AuthGuard],data: { roles: ['CANDIDAT'] }},
  {path: 'entreprise/offres',component: EntrepriseoffresComponent,canActivate: [AuthGuard],data: { roles: ['ENTREPRISE'] }},
 {
    path: 'mescandidatures',
    component: MescandidaturesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ETUDIANT','CANDIDAT'] }
  },
  {path: 'resetpassword', component: ResetpasswordComponent},
  {path: 'resetpasswordwithtoken', component: ResetpasswordWithTokenComponent},
  {path: 'institution/home', component: InstitutionhomeComponent,},
  { path: 'offre/:id', component: OffredetailsComponent },
  {path: 'paiement', component: PaiementComponent},
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
