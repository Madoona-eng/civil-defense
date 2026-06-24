export interface District {
  id: string;
  code?: number;
  name: string;
}

export interface DistrictRequest {
  code: number;
  name: string;
}

export type CreateDistrictRequest = DistrictRequest;

export type UpdateDistrictRequest = DistrictRequest;

export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  errorCode: string;
  message: string;
}