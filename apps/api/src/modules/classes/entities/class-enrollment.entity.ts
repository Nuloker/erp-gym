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
import { Student } from '../../students/entities/student.entity';

/**
 * ClassEnrollment Entity
 * Representa a inscrição de um aluno em uma turma específica.
 * Controla quais alunos participam de cada turma.
 *
 * Regras:
 * - Um aluno não pode se inscrever duas vezes na mesma turma
 * - A turma não pode exceder sua capacidade máxima
 * - Inscrições podem ser canceladas mantendo histórico
 */
@Entity('class_enrollments')
export class ClassEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Vínculo com a academia (multi-tenant)
  @Column({ nullable: false })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // Turma em que o aluno está inscrito
  @Column({ nullable: false })
  classGroupId: string;

  @ManyToOne(() => ClassGroup, { nullable: false })
  @JoinColumn({ name: 'classGroupId' })
  classGroup: ClassGroup;

  // Aluno inscrito na turma
  @Column({ nullable: false })
  studentId: string;

  @ManyToOne(() => Student, { nullable: false })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  // Se a inscrição está ativa ou foi cancelada
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
