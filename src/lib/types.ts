export type UserRole = "SUPER_ADMIN" | "COLLEGE_ADMIN" | "STUDENT";

export interface AuthUser {
  user_id: string;
  role: UserRole;
  full_name?: string | null;
  college_id?: string | null;
  must_change_password?: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  role: UserRole;
  user_id: string;
  full_name?: string | null;
  must_change_password?: boolean;
}

export interface ChangePasswordRequest {
  new_password: string;
}

export interface AdminResetPasswordResponse {
  temporary_password: string;
  must_change_password: boolean;
}

export interface College {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  duration_weeks?: number | null;
  is_active: boolean;
}

export interface Student {
  id: string;
  college_id: string;
  full_name: string;
  father_name?: string | null;
  phone: string;
  email: string;
  gender?: string | null;
  roll_number?: string | null;
  graduation_year?: number | null;
  created_at: string;
}

export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "DROPPED";
export type CertificateApproval = "PENDING" | "APPROVED" | "REJECTED";

export type TrainingType = "INTERNSHIP" | "INDUSTRIAL_TRAINING";

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  college_id: string;
  training_type: TrainingType;
  internship_id: string;
  roll_number?: string | null;
  aicte_internship_id?: string | null;
  status: EnrollmentStatus;
  certificate_approval: CertificateApproval;
  admission_date?: string | null;
  relieving_date?: string | null;
  performance_grade?: string | null;
}

export type VerificationStatus = "VALID" | "REVOKED";

export interface Certificate {
  id: string;
  enrollment_id: string;
  issue_date: string;
  pdf_path?: string | null;
  qr_code_path?: string | null;
  verification_status: VerificationStatus;
  version: number;
}

export interface VerificationResponse {
  verification_status: VerificationStatus;
  student_id: string;
  student_name: string;
  father_name?: string | null;
  college_name: string;
  course_name: string;
  internship_id: string;
  training_type: TrainingType;
  admission_date?: string | null;
  relieving_date?: string | null;
  performance_grade?: string | null;
  certificate_id: string;
  issue_date: string;
  issued_by: string;
}

export interface ImportRowError {
  row_number: number;
  errors: string[];
  raw_data: Record<string, unknown>;
}

export interface ImportReport {
  success_count: number;
  failure_count: number;
  errors: ImportRowError[];
  accounts_created: number;
}

export interface AuditLogOut {
  id: string;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  old_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  timestamp: string;
}

export interface DashboardStats {
  total_colleges: number;
  total_students: number;
  total_enrollments: number;
  active_students: number;
  completed_students: number;
  dropped_students: number;
  certificates_generated: number;
  certificates_revoked: number;
}

export interface CertificateTemplateOut {
  id: string;
  name: string;
  is_active: boolean;
  file_path: string;
}

export interface SignatureOut {
  id: string;
  label: string;
  is_active: boolean;
  image_path: string;
}

export interface CourseStat {
  course_id: string;
  course_name: string;
  enrollment_count: number;
}

export interface CollegeStat {
  college_id: string;
  college_name: string;
  student_count: number;
}