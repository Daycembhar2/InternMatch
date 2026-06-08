import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidathomeComponent } from './candidathome.component';

describe('CandidathomeComponent', () => {
  let component: CandidathomeComponent;
  let fixture: ComponentFixture<CandidathomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CandidathomeComponent]
    });
    fixture = TestBed.createComponent(CandidathomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
