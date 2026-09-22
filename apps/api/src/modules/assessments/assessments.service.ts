import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhysicalAssessment } from './entities/physical-assessment.entity';
import { CreatePhysicalAssessmentDto } from './dto/create-physical-assessment.dto';
import { UpdatePhysicalAssessmentDto } from './dto/update-physical-assessment.dto';

/**
 * AssessmentsService
 * Camada de regras de negócio do módulo de avaliações físicas.
 *
 * Gerencia:
 * - Criação de avaliações físicas por aluno
 * - Listagem e histórico de avaliações
 * - Cálculo automático de IMC ao criar/atualizar
 *
 * Regras principais:
 * - Todas as operações isoladas por tenantId
 * - IMC calculado automaticamente se peso e altura informados
 * - Histórico preservado — sem soft delete nas avaliações antigas
 */
@Injectable()
export class AssessmentsService {
  constructor(
    @InjectRepository(PhysicalAssessment)
    private readonly assessmentRepository: Repository<PhysicalAssessment>,
  ) {}

  // ── AVALIAÇÕES ───────────────────────────────────────────

  /**
   * Cria uma nova avaliação física.
   * Calcula IMC automaticamente se peso e altura forem informados.
   */
  async create(
    dto: CreatePhysicalAssessmentDto,
    tenantId: string,
  ): Promise<PhysicalAssessment> {
    // Calcula IMC automaticamente se peso e altura disponíveis
    let bmi = dto.bmi;
    if (!bmi && dto.weight && dto.height) {
      const heightInMeters = dto.height / 100;
      bmi = Number((dto.weight / (heightInMeters * heightInMeters)).toFixed(2));
    }

    // Calcula massa gorda automaticamente se percentual e peso disponíveis
    let fatMass = dto.fatMass;
    if (!fatMass && dto.bodyFatPercentage && dto.weight) {
      fatMass = Number(((dto.bodyFatPercentage / 100) * dto.weight).toFixed(2));
    }

    // Calcula massa magra automaticamente
    let leanMass = dto.leanMass;
    if (!leanMass && dto.weight && fatMass) {
      leanMass = Number((dto.weight - fatMass).toFixed(2));
    }

    const assessment = this.assessmentRepository.create({
      ...dto,
      bmi,
      fatMass,
      leanMass,
      tenantId,
    });

    return this.assessmentRepository.save(assessment);
  }

  /**
   * Lista todas as avaliações do tenant.
   * Retorna aluno e avaliador vinculados.
   * Ordenado por data de avaliação decrescente.
   */
  async findAll(tenantId: string): Promise<PhysicalAssessment[]> {
    return this.assessmentRepository.find({
      where: { tenantId },
      relations: ['student', 'evaluator'],
      order: { assessmentDate: 'DESC' },
    });
  }

  /**
   * Lista todas as avaliações de um aluno específico.
   * Retorna histórico completo ordenado por data decrescente.
   */
  async findByStudent(
    studentId: string,
    tenantId: string,
  ): Promise<PhysicalAssessment[]> {
    return this.assessmentRepository.find({
      where: { studentId, tenantId },
      relations: ['evaluator'],
      order: { assessmentDate: 'DESC' },
    });
  }

  /**
   * Busca uma avaliação específica pelo ID.
   * Lança NotFoundException se não encontrada.
   */
  async findOne(id: string, tenantId: string): Promise<PhysicalAssessment> {
    const assessment = await this.assessmentRepository.findOne({
      where: { id, tenantId },
      relations: ['student', 'evaluator'],
    });

    if (!assessment) {
      throw new NotFoundException('Avaliação física não encontrada');
    }

    return assessment;
  }

  /**
   * Atualiza uma avaliação existente.
   * Recalcula IMC se peso ou altura forem alterados.
   */
  async update(
    id: string,
    dto: UpdatePhysicalAssessmentDto,
    tenantId: string,
  ): Promise<PhysicalAssessment> {
    const assessment = await this.findOne(id, tenantId);

    Object.assign(assessment, dto);

    // Recalcula IMC se peso ou altura foram alterados
    if (dto.weight || dto.height) {
      const weight = dto.weight ?? Number(assessment.weight);
      const height = dto.height ?? Number(assessment.height);
      if (weight && height) {
        const heightInMeters = height / 100;
        assessment.bmi = Number(
          (weight / (heightInMeters * heightInMeters)).toFixed(2),
        );
      }
    }

    return this.assessmentRepository.save(assessment);
  }

  /**
   * Remove uma avaliação com soft delete.
   */
  async remove(id: string, tenantId: string): Promise<{ message: string }> {
    const assessment = await this.findOne(id, tenantId);
    await this.assessmentRepository.softDelete(assessment.id);
    return { message: 'Avaliação removida com sucesso' };
  }
}
