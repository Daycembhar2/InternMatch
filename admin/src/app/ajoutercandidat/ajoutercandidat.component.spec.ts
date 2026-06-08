import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutercandidatComponent } from './ajoutercandidat.component';

describe('AjoutercandidatComponent', () => {
  let component: AjoutercandidatComponent;
  let fixture: ComponentFixture<AjoutercandidatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AjoutercandidatComponent]
    });
    fixture = TestBed.createComponent(AjoutercandidatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
