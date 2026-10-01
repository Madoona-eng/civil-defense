import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseAPI } from '../../Shared/Env/env';
import {
  ApiResponse,
  InspectionItem,
  InspectionList,
  InspectionStepDetails,
  PagedResult,
} from '../Models/inspection';

@Injectable({
  providedIn: 'root',
})
export class InspectionService {
  private readonly apiUrl = `${BaseAPI}/api/InspectionStep/`;

  constructor(private readonly http: HttpClient) {}

  getAll(query: InspectionList): Observable<ApiResponse<PagedResult<InspectionItem>>> {
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

    return this.http.get<ApiResponse<PagedResult<InspectionItem>>>(`${this.apiUrl}inspection`, {
      params,
    });
  }

  getById(id: string): Observable<ApiResponse<InspectionStepDetails>> {
    return this.http.get<ApiResponse<InspectionStepDetails>>(`${this.apiUrl}${id}/inspection`);
  }

  updateInspection(id: string, formData: FormData): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}${id}/inspection`, formData);
  }

  moveToFinalApproval(id: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}${id}/move-to-final-approval`, {});
  }

  deleteAttachment(attachmentId: string, type: string): Observable<ApiResponse<boolean>> {
    const params = new HttpParams().set('type', type);

    return this.http.delete<ApiResponse<boolean>>(
      `${BaseAPI}/api/LicensingProcess/attachments/${attachmentId}`,
      { params },
    );
  }
}
