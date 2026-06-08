import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterentrepriseComponent } from './ajouterentreprise.component';

describe('AjouterentrepriseComponent', () => {
  let component: AjouterentrepriseComponent;
  let fixture: ComponentFixture<AjouterentrepriseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AjouterentrepriseComponent]
    });
    fixture = TestBed.createComponent(AjouterentrepriseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
