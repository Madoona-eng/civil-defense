export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  errorCode: string;
  message: string;
}

export interface FinalApprovalItem {
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

export interface FinalApprovalQuery {
  districtId?: string;
  requestingEntityId?: string;
  activityTypeId?: string;
  opinion?: string;
  searchTerm?: string;
  pageNumber: number;
  pageSize: number;
}

export interface LookupItem {
  id: string;
  name: string;
  code?: number;
}

export interface FinalApprovalFormModel {
  reviewStatus: 'Accepted' | 'Rejected';
  rejectionNote: string;
  isPaid: boolean;
}

export interface FinalApprovalAttachment {
  id: string;
  fileName: string;
  filePath: string;
  uploadedAtStep: string;
  uploadedAt: string;
}

export interface FinalApprovalNote {
  content: string;
  writtenBy: string;
  processStep: string;
  writtenAt: string;
}

export interface FinalApprovalReview {
  content?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface FinalApprovalDetails {
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

  entityLetters: FinalApprovalAttachment[];
  proofDocuments: FinalApprovalAttachment[];
  engineeringReports: FinalApprovalAttachment[];
  inspectionReports: FinalApprovalAttachment[];
  otherAttachments: FinalApprovalAttachment[];

  notes: FinalApprovalNote[];
  reviews: FinalApprovalReview[];
}