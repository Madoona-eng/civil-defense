import { ApplicationStatus, InspectionOpinion, ReviewStatus } from '../../Shared/Enums/enums';

export interface FinalApprovalItem {
  id: string;
  transactionCode: string;
  submissionDate: string;
  establishmentName: string;
  establishmentAddress: string;
  requestingEntity: string;
  isReturned: boolean;
  district: string;
  activityType: string;
  applicantName: string;
  currentStep: string;
}

export interface FinalApprovalFilter {
  districtId?: string;
  requestingEntityId?: string;
  activityTypeId?: string;
  opinion?: InspectionOpinion;
  finalStatus?: ApplicationStatus;
  submissionDateFrom?: string;
  submissionDateTo?: string;
  searchTerm?: string;
  pageNumber: number;
  pageSize: number;
}


export type AttachmentType =
  | 'entityLetters'
  | 'proofDocuments'
  | 'engineeringReports'
  | 'inspectionReports'
  | 'otherAttachments';

// قيم الـ query param `type` في DELETE /api/LicensingProcess/attachments/{id}
export const ATTACHMENT_API_TYPES: Record<AttachmentType, string> = {
  entityLetters: 'EntityLetter',
  proofDocuments: 'ProofDocument',
  engineeringReports: 'EngineeringReport',
  inspectionReports: 'InspectionReport',
  otherAttachments: 'OtherAttachment',
};

export interface AttachmentGroup {
  title: string;
  files: FinalApprovalAttachment[];
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
  reviewStatus: ReviewStatus;
  isPaid: boolean;
  reviewedBy: string;
  reviewedAt: string;
}

export interface FinalApprovalStepNote {
  content: string;
  createdByUserName: string;
  processStep: string;
  createdAt: string;
}

export interface FinalApprovalStepDetails {
  transactionCode: string;
  submissionDate: string;
  inspectorName: string | null;
  opinion: InspectionOpinion | null;
  finalStatus: ApplicationStatus | null;

  entityLetters: FinalApprovalAttachment[];
  proofDocuments: FinalApprovalAttachment[];
  engineeringReports: FinalApprovalAttachment[];
  inspectionReports: FinalApprovalAttachment[];
  otherAttachments: FinalApprovalAttachment[];

  notes: FinalApprovalStepNote[];
  reviews: FinalApprovalReview[];
}
