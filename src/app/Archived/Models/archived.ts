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
  submissionDateFrom?: string;
  submissionDateTo?: string;
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
  createdByUserName: string;
  processStep: string;
  createdAt: string;
}

export interface ArchivedReview {
  reviewStatus: string;
  isPaid: boolean;
  reviewedBy: string;
  reviewedAt: string;
}

export interface ArchivedDetails {
  applicantName: string;
  transactionCode: string;
  establishmentName: string;
  establishmentAddress: string;
  requestingEntity: string;
  district: string;
  activityType: string;
  submissionDate: string;
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
