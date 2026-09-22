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
import { Modality } from './modality.entity';
import { User } from '../../users/entities/user.entity';
import { ClassSchedule } from './class-schedule.entity';
import { ClassEnrollment } from './class-enrollment.entity';

/**
 * ClassGroup Entity
 * Representa uma turma/aula específica dentro de uma modalidade.
 * Exemplo: "Funcional - Turma Manhã", "Spinning - Turma Avançado".
 *
 * Cada turma tem:
 * - Uma modalidade vinculada
 * - Um professor responsável
 * - Capacidade máxima de alunos
 * - Múltiplos horários recorrentes (ClassSchedule)
 * - Lista de alunos matriculados (ClassEnrollment)
 */
@Entity('class_groups')
export class ClassGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Vínculo com a academia (multi-tenant)
  @Column({ nullable: false })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // Modalidade da turma ex: Funcional, Spinning
  @Column({ nullable: false })
  modalityId: string;

  @ManyToOne(() => Modality)
  @JoinColumn({ name: 'modalityId' })
  modality: Modality;

  // Professor responsável pela turma
  @Column({ nullable: true })
  teacherId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  // Nome da turma ex: "Funcional Manhã", "Spinning Avançado"
  @Column({ length: 100 })
  name: string;

  // Capacidade máxima de alunos na turma — 0 = ilimitado
  @Column({ default: 0 })
  maxCapacity: number;

  // Se a turma está ativa e aceitando inscrições
  @Column({ default: true })
  isActive: boolean;

  // Observações sobre a turma
  @Column({ type: 'text', nullable: true })
  observations: string;

  // Horários recorrentes da turma (dias e horas)
  @OneToMany(() => ClassSchedule, (schedule) => schedule.classGroup, {
    cascade: false,
    eager: false,
  })
  schedules: ClassSchedule[];

  // Alunos matriculados na turma
  @OneToMany(() => ClassEnrollment, (enrollment) => enrollment.classGroup, {
    cascade: false,
    eager: false,
  })
  enrollments: ClassEnrollment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
