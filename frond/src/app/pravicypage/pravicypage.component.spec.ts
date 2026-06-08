import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PravicypageComponent } from './pravicypage.component';

describe('PravicypageComponent', () => {
  let component: PravicypageComponent;
  let fixture: ComponentFixture<PravicypageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PravicypageComponent]
    });
    fixture = TestBed.createComponent(PravicypageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
