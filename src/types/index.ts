export type Role = "User" | "Manager" | "Admin";

export interface User {
  manv: string;
  name: string;
  dept: string;
  title: string;
  password?: string;
  role: Role;
  status?: "ACTIVE" | "INACTIVE";
}

export type Classification = "Xuất sắc" | "Giỏi" | "Khá" | "Trung Bình" | "Yếu";

export type EvaluationStatus = "SUBMITTED" | "MANAGER_REVIEWED" | "APPROVED";

export interface EvaluationRecord {
  id: string;
  period: string; // e.g., "10-2026"
  evaluatorManv: string;
  evaluatorName: string;
  evaluatorDept: string;
  targetManv: string;
  targetName: string;
  targetDept: string;
  
  // 10 criteria scores
  scores: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    q5: number;
    q6: number;
    q7: number;
    q8: number;
    q9: number;
    q10: number;
  };
  selfTotalScore: number;
  selfClassification: Classification;
  selfFeedback?: string;
  
  // Manager review
  managerScore?: number | null;
  managerClassification?: Classification | null;
  managerFeedback?: string | null;
  managerManv?: string | null;
  managerReviewedAt?: string | null;
  
  // Council / Admin approval
  councilScore?: number | null;
  councilClassification?: Classification | null;
  councilFeedback?: string | null;
  councilApprovedAt?: string | null;
  
  status: EvaluationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface KpiPeriod {
  id: string;
  monthYear: string;
  name: string;
  isOpen: boolean;
  startDate: string;
  endDate: string;
}
