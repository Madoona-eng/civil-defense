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

export interface InspectionAttachment {
  id: string;
  fileName: string;
  filePath: string;
  uploadedAtStep: string;
  uploadedAt: string;
}

export interface InspectionNote {
  content: string;
  writtenBy: string;
  processStep: string;
  writtenAt: string;
}

export interface InspectionDetails {
  id: string;
  transactionCode: string;
  currentStep: string;
  createdBy?: string;
  createdAt?: string;
  isReturned?: boolean;

  submissionDate: string;
  establishmentName: string;
  establishmentAddress: string;
  requestingEntity: string;
  district: string;
  activityType: string;

  applicantName: string;
  applicantRole?: string;
  nationalId?: string;
  responsibleManager?: string;
  phone?: string;

  inspectorName?: string | null;
  opinion?: string | null;
  inspectionNote?: string | null;
  inspectedBy?: string | null;

  finalStatus?: string | null;
  approvedBy?: string | null;
  archivedBy?: string | null;

  entityLetters?: InspectionAttachment[];
  proofDocuments?: InspectionAttachment[];
  engineeringReports?: InspectionAttachment[];
  inspectionReports?: InspectionAttachment[];
  otherAttachments?: InspectionAttachment[];

  notes?: InspectionNote[];
  reviews?: any[];
}

export interface InspectionFormModel {
  inspectorName: string;
  opinion: 'Compliant' | 'NonCompliant';
  inspectionNote: string;
}