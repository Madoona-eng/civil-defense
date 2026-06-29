import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestingEntityManagementComponent } from './requesting-entity-management.component';

describe('RequestingEntityManagementComponent', () => {
  let component: RequestingEntityManagementComponent;
  let fixture: ComponentFixture<RequestingEntityManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestingEntityManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestingEntityManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
