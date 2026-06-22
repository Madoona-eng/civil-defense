import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/civil-defense');
    }
  }

  login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.form.getRawValue()).subscribe(result => {
      this.isLoading = false;

      if (!result.success) {
        this.errorMessage = result.message;
        return;
      }

      this.successMessage = result.message;
      this.errorMessage = '';

      setTimeout(() => {
        this.router.navigateByUrl('/civil-defense');
      }, 1200);
    });
  }

  fillDemoUser(type: 'admin' | 'civil'): void {
    if (type === 'admin') {
      this.form.patchValue({ username: 'admin', password: 'admin123' });
      return;
    }

    this.form.patchValue({ username: 'civil', password: 'civil123' });
  }
}
