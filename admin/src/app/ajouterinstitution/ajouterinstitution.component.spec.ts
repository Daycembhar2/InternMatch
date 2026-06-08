import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterinstitutionComponent } from './ajouterinstitution.component';

describe('AjouterinstitutionComponent', () => {
  let component: AjouterinstitutionComponent;
  let fixture: ComponentFixture<AjouterinstitutionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AjouterinstitutionComponent]
    });
    fixture = TestBed.createComponent(AjouterinstitutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
