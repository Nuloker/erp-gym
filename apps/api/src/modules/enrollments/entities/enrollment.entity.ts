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
import { Plan } from '../../plans/entities/plan.entity';

export enum EnrollmentStatus {
  ACTIVE = 'active', // matrícula ativa
  PENDING = 'pending', // aguardando pagamento
  FROZEN = 'frozen', // pausada temporariamente
  CANCELLED = 'cancelled', // cancelada
  EXPIRED = 'expired', // vencida
}

/**
 * Enrollment Entity
 * Representa a matrícula de um aluno em um plano.
 * É a entidade central do sistema — conecta Student + Plan.
 * Controla datas, status, bloqueios e histórico de acesso.
 */
@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Vínculo com a academia (multi-tenant)
  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // Aluno matriculado
  @Column()
  studentId: string;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  // Plano contratado
  @Column()
  planId: string;

  @ManyToOne(() => Plan)
  @JoinColumn({ name: 'planId' })
  plan: Plan;

  // Data de início da matrícula
  @Column({ type: 'date' })
  startDate: Date;

  // Data de vencimento da matrícula
  @Column({ type: 'date' })
  endDate: Date;

  // Status atual da matrícula
  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  // Motivo do cancelamento — preenchido ao cancelar
  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  // Observações gerais sobre a matrícula
  @Column({ type: 'text', nullable: true })
  observations: string;

  // Se o aluno está bloqueado por inadimplência
  @Column({ default: false })
  isBlocked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
