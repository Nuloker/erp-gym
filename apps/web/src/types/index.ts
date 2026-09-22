/**
 * index.ts — Tipos globais do frontend
 * Define todas as interfaces e tipos TypeScript
 * usados nas páginas, componentes e services.
 * Espelha os contratos da API REST do backend.
 */

// ── AUTH ─────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  mustChangePassword: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// ── USERS ────────────────────────────────────────────────
export type UserRole = 'super_admin' | 'admin' | 'receptionist' | 'financial' | 'teacher';

export interface InternalUser {
  id:                 string;
  tenantId:           string;
  name:               string;
  email:              string;
  role:               UserRole;
  isActive:           boolean;
  mustChangePassword: boolean;
  createdAt:          string;
  updatedAt:          string;
}

// ── STUDENTS ─────────────────────────────────────────────
export type StudentStatus = 'lead' | 'active' | 'pending' | 'blocked' | 'cancelled';
export type StudentGoal = 'weight_loss' | 'hypertrophy' | 'conditioning' | 'rehabilitation' | 'other';

export interface Student {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  document?: string;
  birthDate?: string;
  gender?: string;
  status: StudentStatus;
  goal?: StudentGoal;
  healthNotes?: string;
  observations?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

// ── PLANS ────────────────────────────────────────────────
export type PlanDuration = 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'custom';

export interface Plan {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  price: number;
  duration: PlanDuration;
  durationDays: number;
  recurrence?: 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'custom';
  enrollmentFee: number;
  accessLimit: number;
  cancellationPolicy?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── ENROLLMENTS ──────────────────────────────────────────
export type EnrollmentStatus = 'active' | 'pending' | 'frozen' | 'cancelled' | 'expired';

export interface Enrollment {
  id: string;
  tenantId: string;
  studentId: string;
  planId: string;
  student?: Student;
  plan?: Plan;
  startDate: string;
  endDate: string;
  status: EnrollmentStatus;
  cancellationReason?: string;
  observations?: string;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── FINANCE ──────────────────────────────────────────────
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'transfer' | 'pix' | 'other';

export interface Invoice {
  id: string;
  tenantId: string;
  studentId: string;
  enrollmentId?: string;
  student?: Student;
  description: string;
  amount: number;
  discount: number;
  fine: number;
  interest: number;
  dueDate: string;
  status: InvoiceStatus;
  observations?: string;
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  observations?: string;
  receivedBy?: string;
  createdAt: string;
}

// ── ATTENDANCE ───────────────────────────────────────────
export interface Attendance {
  id: string;
  tenantId: string;
  studentId: string;
  student?: Student;
  checkedInAt: string;
  observations?: string;
  registeredBy?: string;
  createdAt: string;
}

// ── DASHBOARD ────────────────────────────────────────────
export interface DashboardSummary {
  students: {
    active: number;
    pending: number;
    cancelled: number;
  };
  enrollments: {
    active: number;
    newThisMonth: number;
  };
  finance: {
    pendingInvoices: number;
    overdueInvoices: number;
    revenueThisMonth: number;
  };
  attendance: {
    checkInsToday: number;
    checkInsThisMonth: number;
  };
}

// ── CLASSES ──────────────────────────────────────────────
export interface Modality {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSchedule {
  id: string;
  tenantId: string;
  classGroupId: string;
  dayOfWeek: number; // 0=Dom, 1=Seg, ..., 6=Sáb
  startTime: string;
  endTime: string;
}

export interface ClassEnrollment {
  id: string;
  tenantId: string;
  classGroupId: string;
  studentId: string;
  student?: Student;
  isActive: boolean;
  enrolledAt: string;
}

export interface ClassGroup {
  id: string;
  tenantId: string;
  modalityId: string;
  teacherId?: string;
  modality?: Modality;
  teacher?: User;
  schedules?: ClassSchedule[];
  enrollments?: ClassEnrollment[];
  name: string;
  maxCapacity: number;
  isActive: boolean;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

// ── WORKOUTS ─────────────────────────────────────────────
export interface WorkoutExercise {
  id: string;
  tenantId: string;
  workoutPlanId: string;
  name: string;
  muscleGroup?: string;
  sets?: number;
  reps?: string;
  load?: number;
  restSeconds?: number;
  order: number;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlan {
  id: string;
  tenantId: string;
  studentId: string;
  teacherId?: string;
  student?: Student;
  teacher?: User;
  exercises?: WorkoutExercise[];
  name: string;
  description?: string;
  division?: string;
  isActive: boolean;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

// ── ASSESSMENTS ─────────────────────────────────────────
// ── ASSESSMENTS ──────────────────────────────────────────
export interface PhysicalAssessment {
  id: string;
  tenantId: string;
  studentId: string;
  evaluatorId?: string;
  student?: Student;
  evaluator?: User;
  assessmentDate: string;
  // Medidas principais
  weight?: number;
  height?: number;
  bmi?: number;
  bodyFatPercentage?: number;
  leanMass?: number;
  fatMass?: number;
  // Circunferências em cm
  neckCircumference?: number;
  chestCircumference?: number;
  waistCircumference?: number;
  hipCircumference?: number;
  rightArmCircumference?: number;
  leftArmCircumference?: number;
  rightThighCircumference?: number;
  leftThighCircumference?: number;
  rightCalfCircumference?: number;
  leftCalfCircumference?: number;
  // Metas e observações
  weightGoal?: number;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

// ── API RESPONSE ─────────────────────────────────────────
// Envelope padrão de resposta da API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
