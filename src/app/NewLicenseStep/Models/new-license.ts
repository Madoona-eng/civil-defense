import { ApplicantRole } from "../../Shared/Enums/enums";

export interface NewLicenseFilter {
  districtId?: string;
  requestingEntityId?: string;
  activityTypeId?: string;
  submissionDateFrom?: string;
  submissionDateTo?: string;
  searchTerm?: string;
  pageNumber: number;
  pageSize: number;
}

export interface NewLicenseListItem {
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

export interface CreateProcessDto {
  submissionDate: string;           // 'YYYY-MM-DD'
  requestingEntityId: string;
  establishmentName: string;
  establishmentAddress: string;
  districtId: string;
  activityTypeId: string;
  applicantName: string;
  applicantRole: ApplicantRole;
  nationalId: string;
  responsibleManager: string;
  phone: string;

  entityLetters: File[];
  proofDocuments: File[];
  engineeringReports: File[];
  otherAttachments: File[];
}

export interface AttachmentItem {
  id: string;
  fileName: string;
  filePath: string;
  uploadedAtStep: string;
  uploadedAt: string;
}

export interface NewLicenseDetails {
  id: string;
  transactionCode: string;
  currentStep: string;
  createdBy: string;
  createdAt: string;
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

  entityLetters: AttachmentItem[];
  proofDocuments: AttachmentItem[];
  engineeringReports: AttachmentItem[];
  otherAttachments: AttachmentItem[];
}

export interface AttachmentGroup {
  title: string;
  files: AttachmentItem[];
}