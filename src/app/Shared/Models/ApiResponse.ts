export interface ApiResponse<T> {
  data?: T;
  isSuccess: boolean;
  errorCode: string;
  message: string;
}