import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseAPI } from '../../Shared/Env/env';
import { ApiResponse } from '../../Shared/Models/ApiResponse';
import { PagedResult } from '../../Shared/Models/PagedResult';
import {
  CreateProcessDto,
  NewLicenseDetails,
  NewLicenseFilter,
  NewLicenseListItem,
  UpdateProcessDto,
} from '../Models/new-license';

@Injectable({
  providedIn: 'root',
})
export class NewLicenseService {
  private readonly baseUrl = `${BaseAPI}/api/NewLicenseStep`;
  private readonly attachmentsUrl = `${BaseAPI}/api/LicensingProcess`;

  constructor(private http: HttpClient) {}

  getAll(filter: NewLicenseFilter): Observable<ApiResponse<PagedResult<NewLicenseListItem>>> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber)
      .set('pageSize', filter.pageSize);

    if (filter.districtId) params = params.set('districtId', filter.districtId);
    if (filter.requestingEntityId)
      params = params.set('requestingEntityId', filter.requestingEntityId);
    if (filter.activityTypeId) params = params.set('activityTypeId', filter.activityTypeId);
    if (filter.submissionDateFrom)
      params = params.set('submissionDateFrom', filter.submissionDateFrom);
    if (filter.submissionDateTo) params = params.set('submissionDateTo', filter.submissionDateTo);
    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);

    return this.http.get<ApiResponse<PagedResult<NewLicenseListItem>>>(
      `${this.baseUrl}/new-license`,
      { params },
    );
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}/delete-new-license`);
  }

  moveToInspection(id: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/${id}/move-to-inspection`, {});
  }

  create(dto: CreateProcessDto): Observable<ApiResponse<string>> {
    const formData = new FormData();

    formData.append('SubmissionDate', dto.submissionDate);
    formData.append('RequestingEntityId', dto.requestingEntityId);
    formData.append('EstablishmentName', dto.establishmentName);
    formData.append('EstablishmentAddress', dto.establishmentAddress);
    formData.append('DistrictId', dto.districtId);
    formData.append('ActivityTypeId', dto.activityTypeId);
    formData.append('ApplicantName', dto.applicantName);
    formData.append('ApplicantRole', dto.applicantRole);
    formData.append('NationalId', dto.nationalId);
    formData.append('ResponsibleManager', dto.responsibleManager);
    formData.append('Phone', dto.phone);

    dto.entityLetters.forEach((file) => formData.append('EntityLetters', file, file.name));
    dto.proofDocuments.forEach((file) => formData.append('ProofDocuments', file, file.name));
    dto.engineeringReports.forEach((file) =>
      formData.append('EngineeringReports', file, file.name),
    );
    dto.otherAttachments.forEach((file) => formData.append('OtherAttachments', file, file.name));

    return this.http.post<ApiResponse<string>>(this.baseUrl, formData);
  }

  getById(id: string): Observable<ApiResponse<NewLicenseDetails>> {
    return this.http.get<ApiResponse<NewLicenseDetails>>(`${this.baseUrl}/new-license/${id}`);
  }

  buildFileUrl(filePath: string): string {
    return `${BaseAPI}/${filePath}`;
  }

  update(id: string, dto: UpdateProcessDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/${id}/edit-new-license`, dto);
  }

  addAttachments(processId: string, type: string, files: File[]): Observable<ApiResponse<unknown>> {
    const formData = new FormData();
    formData.append('type', type);
    files.forEach((file) => formData.append('files', file, file.name));

    return this.http.post<ApiResponse<unknown>>(
      `${this.attachmentsUrl}/${processId}/attachments`,
      formData,
    );
  }

  deleteAttachment(attachmentId: string, type: string): Observable<ApiResponse<boolean>> {
    const params = new HttpParams().set('type', type);

    return this.http.delete<ApiResponse<boolean>>(
      `${this.attachmentsUrl}/attachments/${attachmentId}`,
      { params },
    );
  }
}
