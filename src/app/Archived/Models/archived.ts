export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  errorCode: string;
  message: string;
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

export interface LookupItem {
  id: string;
  code: number;
  name: string;
}

export interface Archived {
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

export interface ArchivedFilter {
  districtId?: string;
  requestingEntityId?: string;
  activityTypeId?: string;
  reviewStatus?: 'Accepted' | 'Rejected';
  searchTerm?: string;
  pageNumber: number;
  pageSize: number;
}

export interface ArchivedAttachment {
  id: string;
  fileName: string;
  filePath: string;
  uploadedAtStep: string;
  uploadedAt: string;
}

export interface ArchivedNote {
  content: string;
  writtenBy: string;
  processStep: string;
  writtenAt: string;
}

export interface ArchivedReview {
  reviewStatus: string;
  isPaid: boolean;
  reviewedBy: string;
  reviewedAt: string;
}

export interface ArchivedDetails {
  applicantName: string;
  applicantRole: string;
  nationalId: string;
  responsibleManager: string;
  phone: string;
  inspectorName: string;
  opinion: string;
  finalStatus: string;
  isReturned: boolean;
  createdAt: string;
  createdBy: string;
  inspectedBy: string;
  approvedBy: string;
  archivedBy: string | null;
  entityLetters: ArchivedAttachment[];
  proofDocuments: ArchivedAttachment[];
  engineeringReports: ArchivedAttachment[];
  inspectionReports: ArchivedAttachment[];
  otherAttachments: ArchivedAttachment[];
  notes: ArchivedNote[];
  reviews: ArchivedReview[];
}