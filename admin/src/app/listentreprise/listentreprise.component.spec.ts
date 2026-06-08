import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListentrepriseComponent } from './listentreprise.component';

describe('ListentrepriseComponent', () => {
  let component: ListentrepriseComponent;
  let fixture: ComponentFixture<ListentrepriseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListentrepriseComponent]
    });
    fixture = TestBed.createComponent(ListentrepriseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
