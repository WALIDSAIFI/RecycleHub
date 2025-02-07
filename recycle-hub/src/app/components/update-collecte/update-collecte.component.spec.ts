import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCollecteComponent } from './update-collecte.component';

describe('UpdateCollecteComponent', () => {
  let component: UpdateCollecteComponent;
  let fixture: ComponentFixture<UpdateCollecteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateCollecteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateCollecteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
