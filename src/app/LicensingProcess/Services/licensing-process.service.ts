import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseAPI } from '../../Shared/Env/env';
import { ApiResponse } from '../../Shared/Models/ApiResponse';
import { PagedResult } from '../../Shared/Models/PagedResult';
import {
  DashboardSummaryQuery,
  DeletedProcessItem,
  DeletedProcessQuery,
  LicensingProcessDetails,
  LicensingProcessItem,
  LicensingProcessQuery,
  LicensingProcessUpdateRequest,
  StepCount,
} from '../Models/licensing-process';

@Injectable({
  providedIn: 'root',
})
export class LicensingProcessService {
  private readonly apiUrl = `${BaseAPI}/api/LicensingProcess`;

  constructor(private readonly http: HttpClient) {}

  create(formData: FormData): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(this.apiUrl, formData);
  }

  update(id: string, request: LicensingProcessUpdateRequest): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${id}`, request);
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

    if (query.submissionDateFrom) {
      params = params.set('submissionDateFrom', query.submissionDateFrom);
    }

    if (query.submissionDateTo) {
      params = params.set('submissionDateTo', query.submissionDateTo);
    }

    if (query.searchTerm) {
      params = params.set('searchTerm', query.searchTerm);
    }

    return this.http.get<ApiResponse<PagedResult<LicensingProcessItem>>>(this.apiUrl, {
      params,
    });
  }

  getDashboardSummary(query: DashboardSummaryQuery): Observable<ApiResponse<StepCount[]>> {
    let params = new HttpParams();

    if (query.districtId) {
      params = params.set('districtId', query.districtId);
    }

    if (query.dateFrom) {
      params = params.set('dateFrom', query.dateFrom);
    }

    if (query.dateTo) {
      params = params.set('dateTo', query.dateTo);
    }

    return this.http.get<ApiResponse<StepCount[]>>(`${this.apiUrl}/dashboard-summary`, { params });
  }

  getDeleted(query: DeletedProcessQuery): Observable<ApiResponse<PagedResult<DeletedProcessItem>>> {
    let params = new HttpParams()
      .set('pageNumber', query.pageNumber.toString())
      .set('pageSize', query.pageSize.toString());

    if (query.processStep) {
      params = params.set('processStep', query.processStep);
    }

    if (query.dateFrom) {
      params = params.set('dateFrom', query.dateFrom);
    }

    if (query.dateTo) {
      params = params.set('dateTo', query.dateTo);
    }

    if (query.searchTerm) {
      params = params.set('searchTerm', query.searchTerm);
    }

    return this.http.get<ApiResponse<PagedResult<DeletedProcessItem>>>(`${this.apiUrl}/deleted`, {
      params,
    });
  }

  restore(id: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${id}/restore`, {});
  }
}
