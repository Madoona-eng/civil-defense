import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PagedResult, Archived, ArchivedDetails, ArchivedFilter } from '../Models/archived';

@Injectable({ providedIn: 'root' })
export class ArchivedService {
  private url = '/api/LicensingProcess';

  constructor(private readonly http: HttpClient) {}

  getAll(filter: ArchivedFilter): Observable<ApiResponse<PagedResult<Archived>>> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber)
      .set('pageSize', filter.pageSize);

    if (filter.districtId) params = params.set('districtId', filter.districtId);
    if (filter.requestingEntityId) params = params.set('requestingEntityId', filter.requestingEntityId);
    if (filter.activityTypeId) params = params.set('activityTypeId', filter.activityTypeId);
    if (filter.reviewStatus) params = params.set('reviewStatus', filter.reviewStatus);
    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);

    return this.http.get<ApiResponse<PagedResult<Archived>>>(`${this.url}/archive`, { params });
  }

  getById(id: string): Observable<ApiResponse<ArchivedDetails>> {
    return this.http.get<ApiResponse<ArchivedDetails>>(`${this.url}/archive/${id}`);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.url}/${id}`);
  }
}