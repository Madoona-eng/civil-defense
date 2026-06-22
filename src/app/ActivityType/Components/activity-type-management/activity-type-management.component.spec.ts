import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityTypeManagementComponent } from './activity-type-management.component';

describe('ActivityTypeManagementComponent', () => {
  let component: ActivityTypeManagementComponent;
  let fixture: ComponentFixture<ActivityTypeManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityTypeManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivityTypeManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
