import { ApplicantRole, ProcessStep } from '../../Shared/Enums/enums';

export interface LicensingProcessCreateRequest {
  submissionDate: string;
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
}

export interface LicensingProcessUpdateRequest {
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
  isReturned: boolean;
}
export interface LicensingProcessQuery {
  districtId?: string;
  requestingEntityId?: string;
  activityTypeId?: string;
  processStep?: ProcessStep;
  submissionDateFrom?: string;
  submissionDateTo?: string;
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
  createdByUserName: string;
  processStep: string;
  createdAt: string;
}

export interface LicensingReview {
  reviewStatus: string;
  isPaid: boolean;
  reviewedBy: string;
  reviewedAt: string;
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

export interface StepCount {
  step: ProcessStep;
  count: number;
}

export interface DashboardSummaryQuery {
  districtId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DistrictCount {
  districtId: string;
  districtName: string;
  count: number;
}

export interface DeletedProcessItem {
  id: string;
  transactionCode: string;
  submissionDate: string;
  establishmentName: string;
  establishmentAddress: string;
  requestingEntity: string;
  district: string;
  activityType: string;
  applicantName: string;
  currentStep: ProcessStep;
  deletedAt: string | null;
  deletedBy: string | null;
}

export interface DeletedProcessQuery {
  processStep?: ProcessStep;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
  pageNumber: number;
  pageSize: number;
}
