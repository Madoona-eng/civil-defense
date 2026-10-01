import { ApplicantRole } from '../../Shared/Enums/enums';

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
  submissionDate: string; // 'YYYY-MM-DD'
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
  requestingEntityId: string;
  district: string;
  districtId: string;
  activityType: string;
  activityTypeId: string;
  applicantName: string;
  applicantRole: ApplicantRole;
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

export interface UpdateProcessDto {
  submissionDate: string;
  establishmentName: string;
  establishmentAddress: string;
  requestingEntityId: string;
  districtId: string;
  activityTypeId: string;
  applicantName: string;
  applicantRole: ApplicantRole;
  nationalId: string;
  responsibleManager: string;
  phone: string;
}

export type AttachmentField =
  | 'entityLetters'
  | 'proofDocuments'
  | 'engineeringReports'
  | 'otherAttachments';

export const ATTACHMENT_TYPES: Record<AttachmentField, { label: string; type: string }> = {
  entityLetters: { label: 'خطابات الجهة', type: 'EntityLetter' },
  proofDocuments: { label: 'أوراق الثبوت', type: 'ProofDocument' },
  engineeringReports: { label: 'التقارير الهندسية', type: 'EngineeringReport' },
  otherAttachments: { label: 'مرفقات أخرى', type: 'OtherAttachment' },
};

// لازم تفضل بعد ATTACHMENT_TYPES
export const ATTACHMENT_FIELDS = Object.keys(ATTACHMENT_TYPES) as AttachmentField[];

export function emptyRecord<T>(): Record<AttachmentField, T[]> {
  return { entityLetters: [], proofDocuments: [], engineeringReports: [], otherAttachments: [] };
}

export function pickAttachments(d: NewLicenseDetails): Record<AttachmentField, AttachmentItem[]> {
  return {
    entityLetters: d.entityLetters,
    proofDocuments: d.proofDocuments,
    engineeringReports: d.engineeringReports,
    otherAttachments: d.otherAttachments,
  };
}
