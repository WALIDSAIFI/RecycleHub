import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCollecteComponent } from './add-collecte.component';

describe('AddCollecteComponent', () => {
  let component: AddCollecteComponent;
  let fixture: ComponentFixture<AddCollecteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCollecteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddCollecteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
