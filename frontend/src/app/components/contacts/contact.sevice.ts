import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiResponse } from '../../shared/models/auth';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private API = 'http://localhost:3000/api/contacts';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getContacts(page: number, filters: any, limit: number = 5) {
    const headers = this.getAuthHeaders();
    const search = filters.name || filters.phone || filters.address || '';

    return this.http.get(`${this.API}`, {
      params: {
        page: page.toString(),
        limit: limit.toString(),
        search,
      },
      headers,
    });
  }

  addContact(contact: any) {
    const headers = this.getAuthHeaders();

    return this.http.post<ApiResponse>(this.API, contact, { headers });
  }

  deleteContact(id: string) {
    const headers = this.getAuthHeaders();

    return this.http.delete(`${this.API}/${id}`, { headers });
  }
}
