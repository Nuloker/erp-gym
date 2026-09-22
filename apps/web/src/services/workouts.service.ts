/**
 * workouts.service.ts
 * Responsável pelas chamadas HTTP do módulo de treinos.
 */
import { api } from '@/lib/api';
import { WorkoutPlan, WorkoutExercise } from '@/types';

export const workoutsService = {
  // ── FICHAS ───────────────────────────────────────────────

  /** Lista todas as fichas do tenant */
  async findAll(): Promise<WorkoutPlan[]> {
    const { data } = await api.get('/workouts/plans');
    return data;
  },

  /** Lista fichas de um aluno específico */
  async findByStudent(studentId: string): Promise<WorkoutPlan[]> {
    const { data } = await api.get(`/workouts/plans/student/${studentId}`);
    return data;
  },

  /** Busca uma ficha com todos os exercícios */
  async findOne(id: string): Promise<WorkoutPlan> {
    const { data } = await api.get(`/workouts/plans/${id}`);
    return data;
  },

  /** Cria uma nova ficha de treino */
  async createPlan(payload: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    const { data } = await api.post('/workouts/plans', payload);
    return data;
  },

  /** Atualiza uma ficha de treino */
  async updatePlan(id: string, payload: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    const { data } = await api.patch(`/workouts/plans/${id}`, payload);
    return data;
  },

  /** Remove uma ficha de treino */
  async removePlan(id: string): Promise<void> {
    await api.delete(`/workouts/plans/${id}`);
  },

  // ── EXERCÍCIOS ───────────────────────────────────────────

  /** Adiciona exercício a uma ficha */
  async createExercise(payload: Partial<WorkoutExercise>): Promise<WorkoutExercise> {
    const { data } = await api.post('/workouts/exercises', payload);
    return data;
  },

  /** Atualiza um exercício */
  async updateExercise(id: string, payload: Partial<WorkoutExercise>): Promise<WorkoutExercise> {
    const { data } = await api.patch(`/workouts/exercises/${id}`, payload);
    return data;
  },

  /** Remove um exercício */
  async removeExercise(id: string): Promise<void> {
    await api.delete(`/workouts/exercises/${id}`);
  },
};
