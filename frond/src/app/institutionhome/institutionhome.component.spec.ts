import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstitutionhomeComponent } from './institutionhome.component';

describe('InstitutionhomeComponent', () => {
  let component: InstitutionhomeComponent;
  let fixture: ComponentFixture<InstitutionhomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InstitutionhomeComponent]
    });
    fixture = TestBed.createComponent(InstitutionhomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
