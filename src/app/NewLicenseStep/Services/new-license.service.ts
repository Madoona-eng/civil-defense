import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseAPI } from '../../Shared/Env/env';
import { NewLicenseFilter, NewLicenseListItem } from '../Models/new-license';
import { ApiResponse } from '../../Shared/Models/ApiResponse';
import { PagedResult } from '../../Shared/Models/PagedResult';

@Injectable({
  providedIn: 'root'
})
export class NewLicenseService {
  private readonly baseUrl = `${BaseAPI}/api/NewLicenseStep`;

  constructor(private http: HttpClient) {}

  getAll(filter: NewLicenseFilter): Observable<ApiResponse<PagedResult<NewLicenseListItem>>> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber)
      .set('pageSize', filter.pageSize);

    if (filter.districtId) params = params.set('districtId', filter.districtId);
    if (filter.requestingEntityId) params = params.set('requestingEntityId', filter.requestingEntityId);
    if (filter.activityTypeId) params = params.set('activityTypeId', filter.activityTypeId);
    if (filter.submissionDateFrom) params = params.set('submissionDateFrom', filter.submissionDateFrom);
    if (filter.submissionDateTo) params = params.set('submissionDateTo', filter.submissionDateTo);
    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);

    return this.http.get<ApiResponse<PagedResult<NewLicenseListItem>>>(`${this.baseUrl}/new-license`, { params });
  }
}