export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  errorCode: string;
  message: string;
}

export interface LicensingProcessCreateRequest {
  submissionDate: string;
  requestingEntityId: string;
  establishmentName: string;
  establishmentAddress: string;
  districtId: string;
  activityTypeId: string;
  applicantName: string;
  applicantRole: string;
  nationalId: string;
  responsibleManager: string;
  phone: string;
}

export interface LookupItem {
  id: string;
  name: string;
  code?: number;
}

export interface LicensingProcessItem {
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

export interface LicensingProcessQuery {
  districtId?: string;
  requestingEntityId?: string;
  activityTypeId?: string;
  processStep?: string;
  searchTerm?: string;
  pageNumber: number;
  pageSize: number;
}

export interface LicensingAttachment {
  id: string;
  fileName: string;
  filePath: string;
  uploadedAtStep: string;
  uploadedAt: string;
}

export interface LicensingNote {
  content: string;
  writtenBy: string;
  processStep: string;
  writtenAt: string;
}

export interface LicensingReview {
  content?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface LicensingProcessDetails {
  id: string;
  transactionCode: string;
  currentStep: string;
  createdBy: string;
  createdAt: string;
  isReturned: boolean;

  submissionDate: string;
  establishmentName: string;
  establishmentAddress: string;

  requestingEntity: string;
  district: string;
  activityType: string;

  applicantName: string;
  applicantRole: string;
  nationalId: string;
  responsibleManager: string;
  phone: string;

  inspectorName: string | null;
  opinion: string | null;
  inspectedBy: string | null;

  finalStatus: string | null;
  approvedBy: string | null;
  archivedBy: string | null;

  entityLetters: LicensingAttachment[];
  proofDocuments: LicensingAttachment[];
  engineeringReports: LicensingAttachment[];
  inspectionReports: LicensingAttachment[];
  otherAttachments: LicensingAttachment[];

  notes: LicensingNote[];
  reviews: LicensingReview[];
}