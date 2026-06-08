import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListinstitutionComponent } from './listinstitution.component';

describe('ListinstitutionComponent', () => {
  let component: ListinstitutionComponent;
  let fixture: ComponentFixture<ListinstitutionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListinstitutionComponent]
    });
    fixture = TestBed.createComponent(ListinstitutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
