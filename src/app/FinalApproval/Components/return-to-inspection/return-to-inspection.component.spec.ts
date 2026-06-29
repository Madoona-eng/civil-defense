import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnToInspectionComponent } from './return-to-inspection.component';

describe('ReturnToInspectionComponent', () => {
  let component: ReturnToInspectionComponent;
  let fixture: ComponentFixture<ReturnToInspectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnToInspectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReturnToInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
