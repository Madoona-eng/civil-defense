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
  isReturned: boolean;
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

export interface InspectionList {
  districtId?: string;
  requestingEntityId?: string;
  activityTypeId?: string;
  isReturned?: boolean;
  submissionDateFrom?: string;
  submissionDateTo?: string;
  searchTerm?: string;
  pageNumber: number;
  pageSize: number;
}

export interface LookupItem {
  id: string;
  name: string;
  code?: number;
}

export interface InspectionAttachment {
  id: string;
  fileName: string;
  filePath: string;
  uploadedAtStep: string;
  uploadedAt: string;
}

export interface InspectionNote {
  content: string;
  createdByUserName: string;
  processStep: string;
  createdAt: string;
}

export interface InspectionStepDetails {
  submissionDate: string;
  transactionCode: string;

  inspectorName?: string | null;
  opinion?: string | null;
  isReturned?: boolean;

  entityLetters?: InspectionAttachment[];
  proofDocuments?: InspectionAttachment[];
  engineeringReports?: InspectionAttachment[];
  inspectionReports?: InspectionAttachment[];
  otherAttachments?: InspectionAttachment[];

  notes?: InspectionNote[];
}

export interface InspectionFormModel {
  inspectorName: string;
  opinion: 'Compliant' | 'NonCompliant';
  inspectionNote: string;
}