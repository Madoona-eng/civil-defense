export interface DistrictSummary {
  id: string;
  code: number;
  name: string;
}

export interface DistrictDetails {
  id: string;
  code: number;
  name: string;
}

export interface CreateDistrict {
  code: number;
  name: string;
}

export interface UpdateDistrict {
  name: string;
}

export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  errorCode: string;
  message: string;
}