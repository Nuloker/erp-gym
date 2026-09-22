import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Student } from '../../students/entities/student.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Payment } from './payment.entity';

export enum InvoiceStatus {
  PENDING = 'pending', // aguardando pagamento
  PAID = 'paid', // pago
  OVERDUE = 'overdue', // vencido/inadimplente
  CANCELLED = 'cancelled', // cancelado
}

/**
 * Invoice Entity
 * Representa uma cobrança/mensalidade gerada para um aluno.
 * Cada invoice pode ter múltiplos pagamentos parciais vinculados.
 * É a base do controle financeiro e inadimplência do sistema.
 *
 * O relacionamento com Payment usa cascade: false para evitar
 * que o TypeORM tente nullificar o invoiceId ao salvar a invoice.
 */
@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Vínculo com a academia (multi-tenant)
  @Column({ nullable: false })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // Aluno que deve pagar a cobrança
  @Column({ nullable: false })
  studentId: string;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  // Matrícula relacionada à cobrança — opcional
  @Column({ nullable: true })
  enrollmentId: string;

  @ManyToOne(() => Enrollment, { nullable: true })
  @JoinColumn({ name: 'enrollmentId' })
  enrollment: Enrollment;

  // Descrição da cobrança ex: "Mensalidade Janeiro/2026"
  @Column({ length: 200 })
  description: string;

  // Valor original da cobrança — salvo como number no banco
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  // Valor de desconto aplicado — padrão 0
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  // Valor de multa por atraso — padrão 0
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fine: number;

  // Valor de juros por atraso — padrão 0
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  interest: number;

  // Data de vencimento da cobrança
  @Column({ type: 'date' })
  dueDate: Date;

  // Status atual da cobrança
  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status: InvoiceStatus;

  // Observações internas sobre a cobrança
  @Column({ type: 'text', nullable: true })
  observations: string;

  /**
   * Pagamentos vinculados a esta cobrança.
   * cascade: false — evita que o TypeORM tente atualizar
   * os payments ao salvar a invoice, o que causava
   * o erro de invoiceId sendo nullificado.
   */
  @OneToMany(() => Payment, (payment) => payment.invoice, {
    cascade: false,
    eager: false,
  })
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
