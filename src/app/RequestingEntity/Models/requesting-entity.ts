export interface RequestingEntity {
  id: string;
  name: string;
}

export interface RequestingEntityRequest {
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