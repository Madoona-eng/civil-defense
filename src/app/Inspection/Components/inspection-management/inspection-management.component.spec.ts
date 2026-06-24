import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectionManagementComponent } from './inspection-management.component';

describe('InspectionManagementComponent', () => {
  let component: InspectionManagementComponent;
  let fixture: ComponentFixture<InspectionManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectionManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InspectionManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
