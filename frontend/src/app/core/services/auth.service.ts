import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginCredentials } from '../../shared/models/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private API = 'http://localhost:3000/api/auth';
  private tokenKey = 'token';

  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials) {
    return this.http.post<{ token: string }>(`${this.API}/login`, credentials);
  }

  saveToken(token: string) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken() {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.tokenKey);
    }
    return '';
  }

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.tokenKey);
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
