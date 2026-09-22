import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modality } from './entities/modality.entity';
import { ClassGroup } from './entities/class-group.entity';
import { ClassSchedule } from './entities/class-schedule.entity';
import { ClassEnrollment } from './entities/class-enrollment.entity';
import { CreateModalityDto } from './dto/create-modality.dto';
import { UpdateModalityDto } from './dto/update-modality.dto';
import { CreateClassGroupDto } from './dto/create-class-group.dto';
import { CreateClassScheduleDto } from './dto/create-class-schedule.dto';
import { UpdateClassGroupDto } from './dto/update-class-group.dto';

/**
 * ClassesService
 * Camada de regras de negócio do módulo de turmas e aulas.
 *
 * Gerencia:
 * - Modalidades (Musculação, Funcional, Spinning, etc.)
 * - Turmas (grupos de alunos por modalidade)
 * - Horários recorrentes de cada turma
 * - Inscrições de alunos nas turmas
 *
 * Regras principais:
 * - Turma não pode exceder capacidade máxima
 * - Aluno não pode se inscrever duas vezes na mesma turma
 * - Todas as operações isoladas por tenantId
 */
@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Modality)
    private readonly modalityRepository: Repository<Modality>,

    @InjectRepository(ClassGroup)
    private readonly classGroupRepository: Repository<ClassGroup>,

    @InjectRepository(ClassSchedule)
    private readonly scheduleRepository: Repository<ClassSchedule>,

    @InjectRepository(ClassEnrollment)
    private readonly classEnrollmentRepository: Repository<ClassEnrollment>,
  ) {}

  // ── MODALIDADES ──────────────────────────────────────────

  /**
   * Cria uma nova modalidade no tenant.
   * Verifica duplicidade de nome dentro do mesmo tenant.
   */
  async createModality(dto: CreateModalityDto, tenantId: string) {
    const exists = await this.modalityRepository.findOne({
      where: { name: dto.name, tenantId },
    });

    if (exists) {
      throw new ConflictException('Já existe uma modalidade com esse nome');
    }

    const modality = this.modalityRepository.create({ ...dto, tenantId });
    return this.modalityRepository.save(modality);
  }

  /**
   * Lista todas as modalidades do tenant.
   * Filtra por isActive se informado.
   */
  async findAllModalities(tenantId: string, isActive?: boolean) {
    const where: any = { tenantId };
    if (isActive !== undefined) where.isActive = isActive;

    return this.modalityRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  /**
   * Busca uma modalidade específica pelo ID.
   * Lança NotFoundException se não encontrada.
   */
  async findOneModality(id: string, tenantId: string) {
    const modality = await this.modalityRepository.findOne({
      where: { id, tenantId },
    });

    if (!modality) {
      throw new NotFoundException('Modalidade não encontrada');
    }

    return modality;
  }

  /**
   * Atualiza dados de uma modalidade existente.
   * Verifica duplicidade de nome ao renomear.
   */
  async updateModality(id: string, dto: UpdateModalityDto, tenantId: string) {
    const modality = await this.findOneModality(id, tenantId);

    // Se está alterando o nome, verifica se já existe outra com esse nome
    if (dto.name && dto.name !== modality.name) {
      const exists = await this.modalityRepository.findOne({
        where: { name: dto.name, tenantId },
      });

      if (exists) {
        throw new ConflictException('Já existe uma modalidade com esse nome');
      }
    }

    Object.assign(modality, dto);
    return this.modalityRepository.save(modality);
  }

  /**
   * Remove uma modalidade com soft delete.
   */
  async removeModality(id: string, tenantId: string) {
    const modality = await this.findOneModality(id, tenantId);
    await this.modalityRepository.softDelete(modality.id);
    return { message: 'Modalidade removida com sucesso' };
  }

  // ── TURMAS ───────────────────────────────────────────────

  /**
   * Cria uma nova turma vinculada a uma modalidade.
   * Valida se a modalidade existe no tenant antes de criar.
   */
  async createClassGroup(dto: CreateClassGroupDto, tenantId: string) {
    // Valida se a modalidade existe no tenant
    await this.findOneModality(dto.modalityId, tenantId);

    const classGroup = this.classGroupRepository.create({ ...dto, tenantId });
    return this.classGroupRepository.save(classGroup);
  }

  /**
   * Lista todas as turmas do tenant.
   * Retorna modalidade, professor, horários e inscrições vinculados.
   */
  async findAllClassGroups(tenantId: string) {
    return this.classGroupRepository.find({
      where: { tenantId },
      relations: [
        'modality',
        'teacher',
        'schedules',
        'enrollments',
        'enrollments.student',
      ],
      order: { name: 'ASC' },
    });
  }

  /**
   * Busca uma turma específica pelo ID.
   * Retorna modalidade, professor, horários e alunos inscritos.
   */
  async findOneClassGroup(id: string, tenantId: string) {
    const classGroup = await this.classGroupRepository.findOne({
      where: { id, tenantId },
      relations: [
        'modality',
        'teacher',
        'schedules',
        'enrollments',
        'enrollments.student',
      ],
    });

    if (!classGroup) {
      throw new NotFoundException('Turma não encontrada');
    }

    return classGroup;
  }

  /**
   * Atualiza dados de uma turma existente.
   */
  async updateClassGroup(
    id: string,
    dto: UpdateClassGroupDto,
    tenantId: string,
  ) {
    const classGroup = await this.findOneClassGroup(id, tenantId);
    Object.assign(classGroup, dto);
    return this.classGroupRepository.save(classGroup);
  }

  /**
   * Remove uma turma com soft delete.
   */
  async removeClassGroup(id: string, tenantId: string) {
    const classGroup = await this.findOneClassGroup(id, tenantId);
    await this.classGroupRepository.softDelete(classGroup.id);
    return { message: 'Turma removida com sucesso' };
  }

  // ── HORÁRIOS ─────────────────────────────────────────────

  /**
   * Adiciona um horário recorrente a uma turma.
   * Valida se a turma existe antes de criar o horário.
   */
  async createSchedule(dto: CreateClassScheduleDto, tenantId: string) {
    // Valida se a turma existe no tenant
    await this.findOneClassGroup(dto.classGroupId, tenantId);

    const schedule = this.scheduleRepository.create({ ...dto, tenantId });
    return this.scheduleRepository.save(schedule);
  }

  /**
   * Remove um horário específico de uma turma.
   */
  async removeSchedule(id: string, tenantId: string) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id, tenantId },
    });

    if (!schedule) {
      throw new NotFoundException('Horário não encontrado');
    }

    await this.scheduleRepository.delete(schedule.id);
    return { message: 'Horário removido com sucesso' };
  }

  // ── INSCRIÇÕES ───────────────────────────────────────────

  /**
   * Inscreve um aluno em uma turma.
   *
   * Regras aplicadas:
   * - Aluno não pode estar inscrito duas vezes na mesma turma
   * - Turma não pode exceder a capacidade máxima (se definida)
   */
  async enrollStudent(
    classGroupId: string,
    studentId: string,
    tenantId: string,
  ) {
    // Busca a turma com suas inscrições ativas
    const classGroup = await this.findOneClassGroup(classGroupId, tenantId);

    // Verifica se o aluno já está inscrito na turma
    const existing = await this.classEnrollmentRepository.findOne({
      where: { classGroupId, studentId, tenantId, isActive: true },
    });

    if (existing) {
      throw new ConflictException('Aluno já está inscrito nesta turma');
    }

    // Verifica se a turma atingiu a capacidade máxima
    if (classGroup.maxCapacity > 0) {
      const activeEnrollments =
        classGroup.enrollments?.filter((e) => e.isActive).length ?? 0;

      if (activeEnrollments >= classGroup.maxCapacity) {
        throw new BadRequestException(
          `Turma lotada — capacidade máxima de ${classGroup.maxCapacity} alunos atingida`,
        );
      }
    }

    const enrollment = this.classEnrollmentRepository.create({
      classGroupId,
      studentId,
      tenantId,
      isActive: true,
    });

    return this.classEnrollmentRepository.save(enrollment);
  }

  /**
   * Remove a inscrição de um aluno de uma turma.
   * Marca a inscrição como inativa em vez de deletar — preserva histórico.
   */
  async unenrollStudent(
    classGroupId: string,
    studentId: string,
    tenantId: string,
  ) {
    const enrollment = await this.classEnrollmentRepository.findOne({
      where: { classGroupId, studentId, tenantId, isActive: true },
    });

    if (!enrollment) {
      throw new NotFoundException('Inscrição não encontrada');
    }

    // Marca como inativo em vez de deletar — preserva histórico
    enrollment.isActive = false;
    await this.classEnrollmentRepository.save(enrollment);
    return { message: 'Aluno removido da turma com sucesso' };
  }
}
