export interface ActivityType {
  id: string;
  name: string;
  code?: number;
}

export interface ActivityTypeRequest {
  code: number;
  name: string;
}

export type CreateActivityTypeRequest = ActivityTypeRequest;

export type UpdateActivityTypeRequest = ActivityTypeRequest;

export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  errorCode: string;
  message: string;
}