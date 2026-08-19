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
    // تم تفريغ الكود هنا لإجبار التطبيق على التوقف عند شاشة تسجيل الدخول وعدم التحويل التلقائي
  }

  login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('Login attempt started:', this.form.getRawValue());

    this.authService.login(this.form.getRawValue()).subscribe({
      next: (result: any) => {
        this.isLoading = false;
        console.log('API Response:', result);

        // التعامل مع استجابة الخادم
        const isSuccess = result.isSuccess ?? result.success;
        if (!isSuccess) {
          this.errorMessage = result.message || 'فشل تسجيل الدخول';
          return;
        }

        this.successMessage = result.message || 'تم تسجيل الدخول بنجاح';

        // استخراج الـ Role سواء كان في Root أو داخل object اسمه data
        const userRole = result.data?.role || result.role;
        console.log('User Role extracted:', userRole);

        // التوجيه الفوري للشاشة المناسبة عند الضغط المباشر
        this.navigateToUserHome(userRole);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'حدث خطأ في الاتصال بالخادم';
        console.error('Login API error:', err);
      }
    });
  }

  private navigateToUserHome(role?: string): void {
    let targetPath = '/civil-defense/dashboard';

    switch (role) {
      case 'DataEntry':
        targetPath = '/civil-defense/licensing-processes';
        break;
      case 'Inspector':
        targetPath = '/civil-defense/inspection';
        break;
      case 'FinalApprover':
        targetPath = '/civil-defense/final-approval';
        break;
      case 'Archive':
        targetPath = '/civil-defense/archive';
        break;
      case 'SuperAdmin':
      case 'Admin':
      default:
        targetPath = '/civil-defense/dashboard';
        break;
    }

    console.log(`Navigating to target route: ${targetPath}`);

    this.router.navigateByUrl(targetPath).then(success => {
      console.log('Navigation Status:', success);
      if (!success) {
        console.error(`خطأ: المسار ${targetPath} غير معرف في app.routes.ts`);
      }
    }).catch(err => {
      console.error('Navigation error caught:', err);
    });
  }
}