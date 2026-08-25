import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopLicensesComponent } from './shop-licenses.component';

describe('ShopLicensesComponent', () => {
  let component: ShopLicensesComponent;
  let fixture: ComponentFixture<ShopLicensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopLicensesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShopLicensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
