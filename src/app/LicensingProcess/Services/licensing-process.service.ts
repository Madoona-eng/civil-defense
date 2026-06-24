import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  LicensingProcessDetails,
  LicensingProcessItem,
  LicensingProcessQuery,
  PagedResult
} from '../Models/licensing-process';

@Injectable({
  providedIn: 'root'
})
export class LicensingProcessService {
  private readonly apiUrl = '/api/LicensingProcess';

  // رابط الباك الخاص بفتح الصور والملفات
  private readonly filesBaseUrl = 'https://172.30.1.76:7159';

  constructor(private readonly http: HttpClient) {}

  create(formData: FormData): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(this.apiUrl, formData);
  }

  update(id: string, formData: FormData): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${id}`, formData);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }

  getById(id: string): Observable<ApiResponse<LicensingProcessDetails>> {
    return this.http.get<ApiResponse<LicensingProcessDetails>>(`${this.apiUrl}/${id}`);
  }

  getAll(query: LicensingProcessQuery): Observable<ApiResponse<PagedResult<LicensingProcessItem>>> {
    let params = new HttpParams()
      .set('pageNumber', query.pageNumber.toString())
      .set('pageSize', query.pageSize.toString());

    if (query.districtId) {
      params = params.set('districtId', query.districtId);
    }

    if (query.requestingEntityId) {
      params = params.set('requestingEntityId', query.requestingEntityId);
    }

    if (query.activityTypeId) {
      params = params.set('activityTypeId', query.activityTypeId);
    }

    if (query.processStep) {
      params = params.set('processStep', query.processStep);
    }

    if (query.searchTerm) {
      params = params.set('searchTerm', query.searchTerm);
    }

    return this.http.get<ApiResponse<PagedResult<LicensingProcessItem>>>(this.apiUrl, {
      params
    });
  }

  buildFileUrl(filePath: string): string {
    const cleanPath = filePath
      .replace(/^\/+/, '')
      .replace(/\\/g, '/');

    return encodeURI(`${this.filesBaseUrl}/${cleanPath}`);
  }
}