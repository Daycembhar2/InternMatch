import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrepriseoffresComponent } from './entrepriseoffres.component';

describe('EntrepriseoffresComponent', () => {
  let component: EntrepriseoffresComponent;
  let fixture: ComponentFixture<EntrepriseoffresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EntrepriseoffresComponent]
    });
    fixture = TestBed.createComponent(EntrepriseoffresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
