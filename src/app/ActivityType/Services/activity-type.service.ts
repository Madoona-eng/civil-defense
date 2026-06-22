import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ActivityType,
  ApiResponse,
  CreateActivityTypeRequest,
  UpdateActivityTypeRequest
} from '../Models/activity-type';

@Injectable({
  providedIn: 'root'
})
export class ActivityTypeService {
private readonly apiUrl = '/api/ActivityType';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<ApiResponse<ActivityType[]>> {
    return this.http.get<ApiResponse<ActivityType[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<ActivityType>> {
    return this.http.get<ApiResponse<ActivityType>>(`${this.apiUrl}/${id}`);
  }

  create(model: CreateActivityTypeRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(this.apiUrl, model);
  }

  update(id: string, model: UpdateActivityTypeRequest): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${id}`, model);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}