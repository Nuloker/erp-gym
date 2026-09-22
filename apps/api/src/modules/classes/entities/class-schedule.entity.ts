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
import { ClassGroup } from './class-group.entity';

/**
 * ClassSchedule Entity
 * Representa um horário recorrente de uma turma.
 * Cada turma pode ter múltiplos horários por semana.
 * Exemplo: Segunda e Quarta às 07:00, Sexta às 08:00.
 *
 * dayOfWeek segue o padrão JavaScript:
 * 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta,
 * 4 = Quinta, 5 = Sexta, 6 = Sábado
 */
@Entity('class_schedules')
export class ClassSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Vínculo com a academia (multi-tenant)
  @Column({ nullable: false })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // Turma vinculada a este horário
  @Column({ nullable: false })
  classGroupId: string;

  @ManyToOne(() => ClassGroup, { nullable: false })
  @JoinColumn({ name: 'classGroupId' })
  classGroup: ClassGroup;

  // Dia da semana: 0=Domingo, 1=Segunda ... 6=Sábado
  @Column({ type: 'int' })
  dayOfWeek: number;

  // Hora de início no formato HH:mm ex: "07:00"
  @Column({ length: 5 })
  startTime: string;

  // Hora de término no formato HH:mm ex: "08:00"
  @Column({ length: 5 })
  endTime: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
