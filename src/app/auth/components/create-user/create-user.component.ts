import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { District } from '../../../District/Models/district';
import { DistrictService } from '../../../District/Services/district.service';
import { TranslatePipe } from '../../../Shared/Components/translate.pipe';
import { ApiRegisterResponse, AuthService, RegisterRequest } from '../../services/auth.service';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  return confirmPassword && password !== confirmPassword ? { passwordMismatch: true } : null;
}

function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;

  const errors: ValidationErrors = {};
  if (value.length < 8) errors['minLength'] = true;
  if (!/[a-z]/.test(value)) errors['lowercase'] = true;
  if (!/[A-Z]/.test(value)) errors['uppercase'] = true;
  if (!/[0-9]/.test(value)) errors['digit'] = true;
  if (!/[^a-zA-Z0-9]/.test(value)) errors['special'] = true;

  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.scss',
})
export class CreateUserComponent {
  readonly roles = ['Admin', 'DataEntry', 'Inspector', 'FinalApprover', 'Archive'];
  readonly form = new FormGroup(
    {
      userName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9\-._@+]+$/)],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, strongPasswordValidator],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      role: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      districtId: new FormControl('', {
        nonNullable: true,
      }),
    },
    { validators: passwordsMatchValidator },
  );

  districts: District[] = [];
  loadingDistricts = false;
  private districtsLoaded = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly districtService: DistrictService,
  ) {}

  get isInspector(): boolean {
    return this.form.controls.role.value === 'Inspector';
  }

  onRoleChange(): void {
    const districtControl = this.form.controls.districtId;
    districtControl.setValue('');
    districtControl.markAsUntouched();
    districtControl.setValidators(this.isInspector ? Validators.required : null);
    districtControl.updateValueAndValidity();
    this.errorMessage = '';

    if (this.isInspector && !this.districtsLoaded && !this.loadingDistricts) {
      this.loadDistricts();
    }
  }

  loadDistricts(): void {
    this.loadingDistricts = true;
    this.errorMessage = '';

    this.districtService.getAll().subscribe({
      next: (response) => {
        this.loadingDistricts = false;

        if (!response.isSuccess) {
          this.errorMessage = response.message || 'تعذر تحميل قائمة المراكز';
          return;
        }

        this.districtsLoaded = true;
        this.districts = response.data || [];

        if (this.districts.length === 0) {
          this.errorMessage = 'لا توجد مراكز متاحة لإسناد المستخدم إليها';
        }
      },
      error: (error) => {
        this.loadingDistricts = false;
        console.error('District GET error:', error);
        this.errorMessage =
          error?.error?.message ||
          error?.error?.Message ||
          error?.message ||
          'حدث خطأ أثناء تحميل المراكز';
      },
    });
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.saving) {
      return;
    }

    if (this.isInspector && this.districts.length === 0) {
      this.errorMessage = 'لا توجد مراكز متاحة لإسناد المستخدم إليها';
      return;
    }
    const payload: RegisterRequest = {
      userName: this.form.controls.userName.value.trim(),
      password: this.form.controls.password.value,
      confirmPassword: this.form.controls.confirmPassword.value,
      role: this.form.controls.role.value,
      districtId: this.isInspector ? this.form.controls.districtId.value : null,
    };

    this.saving = true;
    this.authService.register(payload).subscribe({
      next: (response: ApiRegisterResponse) => {
        this.saving = false;

        if (!response.isSuccess) {
          this.errorMessage = response.message || 'تعذر إضافة المستخدم';
          return;
        }

        this.successMessage = response.message || 'تمت إضافة المستخدم بنجاح';
        this.form.reset();
        this.onRoleChange();
      },
      error: (error) => {
        this.saving = false;
        console.error('Account registration error:', error);
        this.errorMessage =
          error?.error?.message ||
          error?.error?.Message ||
          error?.message ||
          'حدث خطأ أثناء إضافة المستخدم';
      },
    });
  }
}
