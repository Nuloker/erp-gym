import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';

/**
 * PhysicalAssessment Entity
 * Representa uma avaliação física de um aluno.
 *
 * Armazena:
 * - Medidas antropométricas (peso, altura, IMC)
 * - Medidas corporais (circunferências)
 * - Dobras cutâneas básicas
 * - Percentual de gordura e massa magra
 * - Metas e observações do avaliador
 * - Vínculo com aluno e professor/avaliador
 */
@Entity('physical_assessments')
export class PhysicalAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Vínculo com a academia (multi-tenant)
  @Column({ nullable: false })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // Aluno avaliado
  @Column({ nullable: false })
  studentId: string;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  // Professor/avaliador responsável — opcional
  @Column({ nullable: true })
  evaluatorId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'evaluatorId' })
  evaluator: User;

  // Data da avaliação
  @Column({ type: 'date' })
  assessmentDate: Date;

  // ── Medidas principais ───────────────────────────────────

  // Peso em kg
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  // Altura em cm
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number;

  // IMC calculado — peso / (altura em m)²
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bmi: number;

  // Percentual de gordura corporal
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bodyFatPercentage: number;

  // Massa magra em kg
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  leanMass: number;

  // Massa gorda em kg
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  fatMass: number;

  // ── Circunferências em cm ────────────────────────────────

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  neckCircumference: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  chestCircumference: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  waistCircumference: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  hipCircumference: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  rightArmCircumference: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  leftArmCircumference: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  rightThighCircumference: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  leftThighCircumference: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  rightCalfCircumference: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  leftCalfCircumference: number;

  // ── Metas e observações ──────────────────────────────────

  // Meta de peso do aluno
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weightGoal: number;

  // Observações do avaliador
  @Column({ type: 'text', nullable: true })
  observations: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
