import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ContactComponent } from './contact/contact.component';
import { SignUpComponent } from './signup/signup.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { SignInComponent } from './signin/signin.component';
import { SignoutComponent } from './signout/signout.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { ResetpasswordWithTokenComponent } from './resetpasswordwithtoken/resetpasswordwithtoken.component';
import { InstitutionhomeComponent } from './institutionhome/institutionhome.component';
import { OffredetailsComponent } from './offredetails/offredetails.component';
import { PaiementComponent } from './paiement/paiement.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ContactComponent,
    SignUpComponent,
    AboutusComponent,
    SignInComponent,
    SignoutComponent,
    HeaderComponent,
    FooterComponent,
    ServicesComponent,
    PravicypageComponent,
    ProfileComponent,
    EtudianthomeComponent,
    EntreprisehomeComponent,
    ListeOffresComponent,
    OfferFormComponent,
    PostulationComponent,
    CandidathomeComponent,
    EntrepriseoffresComponent,
    MescandidaturesComponent,
    ResetpasswordComponent,
    ResetpasswordWithTokenComponent,
    InstitutionhomeComponent,
    OffredetailsComponent,
    PaiementComponent,
   

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule , ReactiveFormsModule , 
    HttpClientModule,
  
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
