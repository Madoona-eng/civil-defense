export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  errorCode: string;
  message: string;
}

export interface InspectionItem {
  id: string;
  transactionCode: string;
  submissionDate: string;
  establishmentName: string;
  establishmentAddress: string;
  requestingEntity: string;
  district: string;
  activityType: string;
  applicantName: string;
  currentStep: string;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface InspectionQuery {
  districtId?: string;
  requestingEntityId?: string;
  activityTypeId?: string;
  searchTerm?: string;
  pageNumber: number;
  pageSize: number;
}

export interface LookupItem {
  id: string;
  name: string;
  code?: number;
}

export interface InspectionFormModel {
  inspectorName: string;
  opinion: 'Compliant' | 'NonCompliant';
  inspectionNote: string;
}