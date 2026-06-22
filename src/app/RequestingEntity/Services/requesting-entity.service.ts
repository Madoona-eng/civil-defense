import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  RequestingEntity,
  CreateRequestingEntityRequest,
  UpdateRequestingEntityRequest
} from '../Models/requesting-entity';

@Injectable({
  providedIn: 'root'
})
export class RequestingEntityService {
  private readonly apiUrl = '/api/RequestingEntity';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<ApiResponse<RequestingEntity[]>> {
    return this.http.get<ApiResponse<RequestingEntity[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<RequestingEntity>> {
    return this.http.get<ApiResponse<RequestingEntity>>(`${this.apiUrl}/${id}`);
  }

  create(model: CreateRequestingEntityRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(this.apiUrl, model);
  }

  update(id: string, model: UpdateRequestingEntityRequest): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${id}`, model);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}