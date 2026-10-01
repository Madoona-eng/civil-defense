import { InspectionOpinion } from "../../Shared/Enums/enums";

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

export const ATTACHMENT_API_TYPES: Record<AttachmentType, string> = {
  entityLetters: 'EntityLetter',
  proofDocuments: 'ProofDocument',
  engineeringReports: 'EngineeringReport',
  inspectionReports: 'InspectionReport',
  otherAttachments: 'OtherAttachment',
};

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
  opinion?: InspectionOpinion;
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
  opinion?: InspectionOpinion | null;
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
  opinion: InspectionOpinion;
  inspectionNote: string;
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