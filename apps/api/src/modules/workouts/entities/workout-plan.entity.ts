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
import { User } from '../../users/entities/user.entity';
import { WorkoutExercise } from './workout-exercise.entity';

/**
 * WorkoutPlan Entity
 * Representa uma ficha de treino de um aluno.
 * Exemplo: "Treino A - Peito e Tríceps", "Treino Full Body".
 *
 * Cada ficha tem:
 * - Um aluno vinculado
 * - Um professor responsável (opcional)
 * - Lista de exercícios
 * - Status ativo/inativo (para versionamento simples)
 */
@Entity('workout_plans')
export class WorkoutPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Vínculo com a academia (multi-tenant)
  @Column({ nullable: false })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // Aluno dono da ficha
  @Column({ nullable: false })
  studentId: string;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  // Professor que criou/gerencia a ficha
  @Column({ nullable: true })
  teacherId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  // Nome da ficha ex: "Treino A", "Full Body"
  @Column({ length: 100 })
  name: string;

  // Descrição ou objetivo da ficha
  @Column({ type: 'text', nullable: true })
  description: string;

  // Divisão: ex "A", "B", "C" ou "Segunda/Quarta/Sexta"
  @Column({ length: 50, nullable: true })
  division: string;

  // Se esta é a ficha ativa do aluno
  @Column({ default: true })
  isActive: boolean;

  // Observações gerais sobre o treino
  @Column({ type: 'text', nullable: true })
  observations: string;

  // Exercícios da ficha
  @OneToMany(() => WorkoutExercise, (exercise) => exercise.workoutPlan, {
    cascade: false,
    eager: false,
  })
  exercises: WorkoutExercise[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
