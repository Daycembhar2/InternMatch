import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterEtudiantComponent } from './ajouteretudiant.component';

describe('AjouterEtudiantComponent', () => {
  let component: AjouterEtudiantComponent;
  let fixture: ComponentFixture<AjouterEtudiantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AjouterEtudiantComponent]
    });
    fixture = TestBed.createComponent(AjouterEtudiantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
