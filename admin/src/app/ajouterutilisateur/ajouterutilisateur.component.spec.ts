import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterUtilisateurComponent } from './ajouterutilisateur.component';

describe('AjouterUtilisateurComponent', () => {
  let component: AjouterUtilisateurComponent;
  let fixture: ComponentFixture<AjouterUtilisateurComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AjouterUtilisateurComponent]
    });
    fixture = TestBed.createComponent(AjouterUtilisateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
