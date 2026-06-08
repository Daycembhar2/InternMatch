import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntreprisehomeComponent } from './entreprisehome.component';

describe('EntreprisehomeComponent', () => {
  let component: EntreprisehomeComponent;
  let fixture: ComponentFixture<EntreprisehomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EntreprisehomeComponent]
    });
    fixture = TestBed.createComponent(EntreprisehomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
