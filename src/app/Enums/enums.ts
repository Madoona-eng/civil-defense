// ============================
// Application Status
// ============================
export enum ApplicationStatus {
  Waiting = 'Waiting',       // مستوفي وغير مسدد
  Closed = 'Closed',         // غير مستوفي وغير مسدد || غير مستوفي ومسدد
  Completed = 'Completed',   // مستوفي ومسدد
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Waiting]: 'قيد الانتظار',
  [ApplicationStatus.Closed]: 'مغلقة',
  [ApplicationStatus.Completed]: 'مكتملة',
};

// ============================
// Inspection Opinion
// ============================
export enum InspectionOpinion {
  Compliant = 'Compliant',
  NonCompliant = 'NonCompliant',
}

export const INSPECTION_OPINION_LABELS: Record<InspectionOpinion, string> = {
  [InspectionOpinion.Compliant]: 'مستوفي',
  [InspectionOpinion.NonCompliant]: 'غير مستوفي',
};

// ============================
// Process Step
// ============================
export enum ProcessStep {
  NewLicense = 'NewLicense',
  Inspection = 'Inspection',
  FinalApproval = 'FinalApproval',
  Archive = 'Archive',
}

export const PROCESS_STEP_LABELS: Record<ProcessStep, string> = {
  [ProcessStep.NewLicense]: 'ترخيص جديد',
  [ProcessStep.Inspection]: 'المعاينة',
  [ProcessStep.FinalApproval]: 'الموافقة النهائية',
  [ProcessStep.Archive]: 'الأرشيف',
};

// ============================
// Review Status
// ============================
export enum ReviewStatus {
  Accepted = 'Accepted',
  Rejected = 'Rejected',
}

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  [ReviewStatus.Accepted]: 'مقبول',
  [ReviewStatus.Rejected]: 'مرفوض',
};