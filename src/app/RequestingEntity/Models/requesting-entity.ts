export interface RequestingEntity {
  id: string;
  code: number;
  name: string;
}

export interface RequestingEntityRequest {
  code: number;
  name: string;
}

export type CreateRequestingEntityRequest = RequestingEntityRequest;

export type UpdateRequestingEntityRequest = RequestingEntityRequest;

export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  errorCode: string;
  message: string;
}