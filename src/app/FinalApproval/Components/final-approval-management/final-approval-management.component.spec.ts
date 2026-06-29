import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalApprovalManagementComponent } from './final-approval-management.component';

describe('FinalApprovalManagementComponent', () => {
  let component: FinalApprovalManagementComponent;
  let fixture: ComponentFixture<FinalApprovalManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalApprovalManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinalApprovalManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
