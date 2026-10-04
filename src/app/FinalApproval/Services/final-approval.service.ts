import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseAPI } from '../../Shared/Env/env';
import { ApiResponse } from '../../Shared/Models/ApiResponse';
import { PagedResult } from '../../Shared/Models/PagedResult';
import {
  FinalApprovalFilter,
  FinalApprovalItem,
  FinalApprovalStepDetails,
} from '../Models/final-approval';

@Injectable({
  providedIn: 'root',
})
export class FinalApprovalService {
  private readonly apiUrl = `${BaseAPI}/api/FinalApprovalStep/`;
  private readonly processUrl = `${BaseAPI}/api/LicensingProcess`;

  constructor(private readonly http: HttpClient) {}

  getAll(query: FinalApprovalFilter): Observable<ApiResponse<PagedResult<FinalApprovalItem>>> {
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

    if (query.finalStatus) {
      params = params.set('finalStatus', query.finalStatus);
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

    return this.http.get<ApiResponse<PagedResult<FinalApprovalItem>>>(
      `${this.apiUrl}final-approval`,
      { params },
    );
  }

  getFinalApprovalDetails(id: string): Observable<ApiResponse<FinalApprovalStepDetails>> {
    return this.http.get<ApiResponse<FinalApprovalStepDetails>>(
      `${this.apiUrl}${id}/final-approval`,
    );
  }

  saveFinalApproval(id: string, formData: FormData): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}${id}/final-approval`, formData);
  }

  deleteAttachment(attachmentId: string, type: string): Observable<ApiResponse<boolean>> {
    const params = new HttpParams().set('type', type);

    return this.http.delete<ApiResponse<boolean>>(
      `${this.processUrl}/attachments/${attachmentId}`,
      { params },
    );
  }

  returnToInspection(id: string, noteContent: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}${id}/return-to-inspection`, {
      noteContent: noteContent,
    });
  }

  moveToArchive(id: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}${id}/move-to-archive`, {});
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.processUrl}/${id}`);
  }
}
