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
