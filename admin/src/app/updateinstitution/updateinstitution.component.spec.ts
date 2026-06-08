import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateinstitutionComponent } from './updateinstitution.component';

describe('UpdateinstitutionComponent', () => {
  let component: UpdateinstitutionComponent;
  let fixture: ComponentFixture<UpdateinstitutionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateinstitutionComponent]
    });
    fixture = TestBed.createComponent(UpdateinstitutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
