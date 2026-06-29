import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistrictManagementComponent } from './district-management.component';

describe('DistrictManagementComponent', () => {
  let component: DistrictManagementComponent;
  let fixture: ComponentFixture<DistrictManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistrictManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DistrictManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
