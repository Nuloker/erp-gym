import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkoutPlan } from './workout-plan.entity';

/**
 * WorkoutExercise Entity
 * Representa um exercício dentro de uma ficha de treino.
 * Armazena séries, repetições, carga, descanso e observações.
 */
@Entity('workout_exercises')
export class WorkoutExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Vínculo com a ficha de treino
  @Column({ nullable: false })
  workoutPlanId: string;

  @ManyToOne(() => WorkoutPlan, (plan) => plan.exercises)
  @JoinColumn({ name: 'workoutPlanId' })
  workoutPlan: WorkoutPlan;

  // Vínculo com o tenant (para queries diretas)
  @Column({ nullable: false })
  tenantId: string;

  // Nome do exercício ex: "Supino Reto", "Agachamento Livre"
  @Column({ length: 100 })
  name: string;

  // Grupo muscular ex: "Peito", "Pernas", "Costas"
  @Column({ length: 50, nullable: true })
  muscleGroup: string;

  // Número de séries
  @Column({ nullable: true })
  sets: number;

  // Número de repetições ex: "12", "8-12", "até a falha"
  @Column({ length: 20, nullable: true })
  reps: string;

  // Carga em kg
  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  load: number;

  // Tempo de descanso em segundos
  @Column({ nullable: true })
  restSeconds: number;

  // Ordem do exercício na ficha
  @Column({ default: 0 })
  order: number;

  // Observações específicas do exercício
  @Column({ type: 'text', nullable: true })
  observations: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
