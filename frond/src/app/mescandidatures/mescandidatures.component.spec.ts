import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MescandidaturesComponent } from './mescandidatures.component';

describe('MescandidaturesComponent', () => {
  let component: MescandidaturesComponent;
  let fixture: ComponentFixture<MescandidaturesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MescandidaturesComponent]
    });
    fixture = TestBed.createComponent(MescandidaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
