import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListoffresComponent } from './listoffres.component';

describe('ListoffresComponent', () => {
  let component: ListoffresComponent;
  let fixture: ComponentFixture<ListoffresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListoffresComponent]
    });
    fixture = TestBed.createComponent(ListoffresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
