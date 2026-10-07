import { InspectionOpinion } from '../../Shared/Enums/enums';
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

export const ATTACHMENT_API_TYPES: Record<AttachmentType, string> = {
  entityLetters: 'EntityLetter',
  proofDocuments: 'ProofDocument',
  engineeringReports: 'EngineeringReport',
  inspectionReports: 'InspectionReport',
  otherAttachments: 'OtherAttachment',
};

export interface InspectionList {
  districtId?: string;
  requestingEntityId?: string;
  activityTypeId?: string;
  isReturned?: boolean;
  opinion?: InspectionOpinion;
  submissionDateFrom?: string;
  submissionDateTo?: string;
  searchTerm?: string;
  pageNumber: number;
  pageSize: number;
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

  establishmentName: string;
  establishmentAddress: string;
  requestingEntity: string;
  district: string;
  activityType: string;
  applicantName: string;

  inspectorName?: string | null;
  opinion?: InspectionOpinion | null;
  isReturned?: boolean;

  entityLetters?: InspectionAttachment[];
  proofDocuments?: InspectionAttachment[];
  engineeringReports?: InspectionAttachment[];
  inspectionReports?: InspectionAttachment[];
  otherAttachments?: InspectionAttachment[];

  notes?: InspectionNote[];
}

export type AttachmentType =
  | 'entityLetters'
  | 'proofDocuments'
  | 'engineeringReports'
  | 'inspectionReports'
  | 'otherAttachments';

export interface AttachmentGroup {
  title: string;
  files: InspectionAttachment[];
}
