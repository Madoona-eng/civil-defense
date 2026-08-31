import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  District,
  CreateDistrictRequest,
  UpdateDistrictRequest,
} from '../Models/district';
import { BaseAPI } from '../../Shared/Env/env';

@Injectable({
  providedIn: 'root',
})
export class DistrictService {
  private readonly apiUrl = `${BaseAPI}/api/District`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<ApiResponse<District[]>> {
    return this.http.get<ApiResponse<District[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<District>> {
    return this.http.get<ApiResponse<District>>(`${this.apiUrl}/${id}`);
  }

  create(model: CreateDistrictRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(this.apiUrl, model);
  }

  update(
    id: string,
    model: UpdateDistrictRequest,
  ): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${id}`, model);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}
