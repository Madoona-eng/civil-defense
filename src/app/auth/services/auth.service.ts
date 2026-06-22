import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  message: string;
  token?: string;
  username?: string;
  role?: string;
}

interface ApiLoginResponse {
  data: {
    userName: string;
    role: string;
    token: string;
    accessTokenExpiresAt: string;
  };
  isSuccess: boolean;
  errorCode: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
private readonly apiUrl = '/api/Account/login';

  private readonly tokenKey = 'token';
  private readonly usernameKey = 'username';
  private readonly roleKey = 'role';

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

 login(data: LoginRequest): Observable<LoginResult> {
  return this.http.post<ApiLoginResponse>(this.apiUrl, data).pipe(
    map(response => {
      if (!response.isSuccess) {
        return {
          success: false,
          message: response.message || 'فشل تسجيل الدخول'
        };
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.userName);
      localStorage.setItem('role', response.data.role);

      return {
        success: true,
        message: response.message,
        token: response.data.token,
        username: response.data.userName,
        role: response.data.role
      };
    }),
    catchError(error => {
      console.log('LOGIN ERROR:', error);

      return of({
        success: false,
        message: error?.error?.message || 'حدث خطأ أثناء الاتصال بالسيرفر'
      });
    })
  );
}

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usernameKey);
    localStorage.removeItem(this.roleKey);

    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUsername(): string {
    return localStorage.getItem(this.usernameKey) || 'المستخدم';
  }

  getRole(): string {
    return localStorage.getItem(this.roleKey) || '';
  }
}