import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, CreateDistrict, DistrictDetails, DistrictSummary, UpdateDistrict } from '../Models/district';

@Injectable({ providedIn: 'root' })

export class DistrictService {
  private url = '/api/District';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<DistrictSummary[]>> {
    return this.http.get<ApiResponse<DistrictSummary[]>>(this.url);
  }

  getById(id: string): Observable<ApiResponse<DistrictDetails>> {
    return this.http.get<ApiResponse<DistrictDetails>>(`${this.url}/${id}`);
  }

  create(model: CreateDistrict): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(this.url, model);
  }

  update(id: string, model: UpdateDistrict): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.url}/${id}`, model);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.url}/${id}`);
  }
}