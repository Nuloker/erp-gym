import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Student } from '../../students/entities/student.entity';

/**
 * Attendance Entity
 * Representa um registro de presença/check-in de um aluno.
 * Cada registro contém data, hora e quem realizou o check-in.
 * Base para relatórios de frequência e controle de acesso.
 */
@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Vínculo com a academia (multi-tenant)
  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // Aluno que realizou o check-in
  @Column()
  studentId: string;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  // Data e hora exata do check-in
  @Column({ type: 'datetime' })
  checkedInAt: Date;

  // Observações sobre o check-in — ex: "Acesso liberado manualmente"
  @Column({ type: 'text', nullable: true })
  observations: string;

  // ID do usuário que registrou o check-in (recepção)
  @Column({ nullable: true })
  registeredBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
