import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { WorkoutExercise } from './entities/workout-exercise.entity';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { CreateWorkoutExerciseDto } from './dto/create-workout-exercise.dto';
import { UpdateWorkoutExerciseDto } from './dto/update-workout-exercise.dto';

/**
 * WorkoutsService
 * Camada de regras de negócio do módulo de treinos.
 *
 * Gerencia:
 * - Fichas de treino por aluno (WorkoutPlan)
 * - Exercícios de cada ficha (WorkoutExercise)
 *
 * Regras principais:
 * - Todas as operações isoladas por tenantId
 * - Ao criar nova ficha ativa, desativa as anteriores do aluno
 * - Exercícios são ordenados pelo campo order
 */
@Injectable()
export class WorkoutsService {
  constructor(
    @InjectRepository(WorkoutPlan)
    private readonly workoutPlanRepository: Repository<WorkoutPlan>,

    @InjectRepository(WorkoutExercise)
    private readonly workoutExerciseRepository: Repository<WorkoutExercise>,
  ) {}

  // ── FICHAS DE TREINO ─────────────────────────────────────

  /**
   * Cria uma nova ficha de treino para um aluno.
   * Se isActive=true, desativa fichas anteriores do mesmo aluno.
   */
  async createWorkoutPlan(dto: CreateWorkoutPlanDto, tenantId: string) {
    // Se nova ficha é ativa, desativa as anteriores do aluno
    if (dto.isActive !== false) {
      await this.workoutPlanRepository.update(
        { studentId: dto.studentId, tenantId, isActive: true },
        { isActive: false },
      );
    }

    const plan = this.workoutPlanRepository.create({ ...dto, tenantId });
    return this.workoutPlanRepository.save(plan);
  }

  /**
   * Lista todas as fichas de um aluno específico.
   * Retorna professor vinculado e contagem de exercícios.
   */
  async findByStudent(studentId: string, tenantId: string) {
    return this.workoutPlanRepository.find({
      where: { studentId, tenantId },
      relations: ['teacher', 'exercises'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lista todas as fichas do tenant (visão do professor/admin).
   * Retorna aluno e professor vinculados.
   */
  async findAll(tenantId: string) {
    return this.workoutPlanRepository.find({
      where: { tenantId },
      relations: ['student', 'teacher'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Busca uma ficha específica com todos os exercícios.
   * Lança NotFoundException se não encontrada.
   */
  async findOne(id: string, tenantId: string) {
    const plan = await this.workoutPlanRepository.findOne({
      where: { id, tenantId },
      relations: ['student', 'teacher', 'exercises'],
    });

    if (!plan) {
      throw new NotFoundException('Ficha de treino não encontrada');
    }

    // Ordena exercícios pelo campo order
    if (plan.exercises) {
      plan.exercises.sort((a, b) => a.order - b.order);
    }

    return plan;
  }

  /**
   * Atualiza dados de uma ficha de treino.
   */
  async updateWorkoutPlan(
    id: string,
    dto: UpdateWorkoutPlanDto,
    tenantId: string,
  ) {
    const plan = await this.findOne(id, tenantId);
    Object.assign(plan, dto);
    return this.workoutPlanRepository.save(plan);
  }

  /**
   * Remove uma ficha de treino com soft delete.
   */
  async removeWorkoutPlan(id: string, tenantId: string) {
    const plan = await this.findOne(id, tenantId);
    await this.workoutPlanRepository.softDelete(plan.id);
    return { message: 'Ficha de treino removida com sucesso' };
  }

  // ── EXERCÍCIOS ───────────────────────────────────────────

  /**
   * Adiciona um exercício a uma ficha de treino.
   * Valida se a ficha existe antes de adicionar.
   */
  async createExercise(dto: CreateWorkoutExerciseDto, tenantId: string) {
    // Valida se a ficha existe no tenant
    await this.findOne(dto.workoutPlanId, tenantId);

    const exercise = this.workoutExerciseRepository.create({
      ...dto,
      tenantId,
    });
    return this.workoutExerciseRepository.save(exercise);
  }

  /**
   * Atualiza um exercício existente.
   */
  async updateExercise(
    id: string,
    dto: UpdateWorkoutExerciseDto,
    tenantId: string,
  ) {
    const exercise = await this.workoutExerciseRepository.findOne({
      where: { id, tenantId },
    });

    if (!exercise) {
      throw new NotFoundException('Exercício não encontrado');
    }

    Object.assign(exercise, dto);
    return this.workoutExerciseRepository.save(exercise);
  }

  /**
   * Remove um exercício de uma ficha.
   */
  async removeExercise(id: string, tenantId: string) {
    const exercise = await this.workoutExerciseRepository.findOne({
      where: { id, tenantId },
    });

    if (!exercise) {
      throw new NotFoundException('Exercício não encontrado');
    }

    await this.workoutExerciseRepository.delete(exercise.id);
    return { message: 'Exercício removido com sucesso' };
  }
}
