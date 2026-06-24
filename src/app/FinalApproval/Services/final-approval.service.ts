import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ApiResponse,
  FinalApprovalDetails,
  FinalApprovalItem,
  FinalApprovalQuery,
  PagedResult
} from '../Models/final-approval';

@Injectable({
  providedIn: 'root'
})
export class FinalApprovalService {
  private readonly apiUrl = '/api/LicensingProcess/final-approval';
  private readonly processUrl = '/api/LicensingProcess';
  private readonly filesBaseUrl = 'https://172.30.1.76:7159';

  constructor(private readonly http: HttpClient) {}

  getAll(query: FinalApprovalQuery): Observable<ApiResponse<PagedResult<FinalApprovalItem>>> {
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

    if (query.opinion) {
      params = params.set('opinion', query.opinion);
    }

    if (query.searchTerm) {
      params = params.set('searchTerm', query.searchTerm);
    }

    return this.http.get<ApiResponse<PagedResult<FinalApprovalItem>>>(this.apiUrl, {
      params
    });
  }

  getById(id: string): Observable<ApiResponse<FinalApprovalDetails>> {
    return this.http.get<ApiResponse<FinalApprovalDetails>>(`${this.processUrl}/${id}`);
  }

  saveFinalApproval(id: string, formData: FormData): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this.processUrl}/${id}/final-approval`,
      formData
    );
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.processUrl}/${id}`);
  }

  buildFileUrl(filePath: string): string {
    const cleanPath = filePath
      .replace(/^\/+/, '')
      .replace(/\\/g, '/');

    return encodeURI(`${this.filesBaseUrl}/${cleanPath}`);
  }
}