import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ApiResponse,
  InspectionStepDetails,
  InspectionItem,
  InspectionList,
  PagedResult,
} from '../Models/inspection';

@Injectable({
  providedIn: 'root',
})
export class InspectionService {
  private readonly apiUrl = '/api/LicensingProcess/inspection';
  private readonly processUrl = '/api/LicensingProcess';

  constructor(private readonly http: HttpClient) {}

  getAll(
    query: InspectionList,
  ): Observable<ApiResponse<PagedResult<InspectionItem>>> {
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

    if (query.isReturned !== undefined) {
      params = params.set('isReturned', query.isReturned.toString());
    }

    if (query.submissionDateFrom) {
      params = params.set('submissionDateFrom', query.submissionDateFrom);
    }

    if (query.submissionDateTo) {
      params = params.set('submissionDateTo', query.submissionDateTo);
    }

    if (query.searchTerm) {
      params = params.set('searchTerm', query.searchTerm);
    }

    return this.http.get<ApiResponse<PagedResult<InspectionItem>>>(
      this.apiUrl,
      {
        params,
      },
    );
  }

  getById(id: string): Observable<ApiResponse<InspectionStepDetails>> {
    return this.http.get<ApiResponse<InspectionStepDetails>>(
      `${this.processUrl}/${id}/inspection`,
    );
  }

  updateInspection(
    id: string,
    formData: FormData,
  ): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this.processUrl}/${id}/inspection`,
      formData,
    );
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.processUrl}/${id}`);
  }

  buildFileUrl(filePath: string): string {
    const cleanPath = filePath.replace(/^\/+/, '').replace(/\\/g, '/');

    return encodeURI(`/${cleanPath}`);
  }
}
