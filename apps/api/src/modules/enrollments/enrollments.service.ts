import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment, EnrollmentStatus } from './entities/enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { PlansService } from '../plans/plans.service';
import { StudentsService } from '../students/students.service';

/**
 * EnrollmentsService
 * Camada de regras de negócio do módulo de matrículas.
 * Responsável por criar e gerenciar matrículas de alunos em planos.
 * Aplica regras como: verificar aluno ativo, calcular data de vencimento,
 * bloquear matrícula duplicada ativa, etc.
 */
@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,

    // Usa o PlansService para buscar e validar o plano escolhido
    private readonly plansService: PlansService,

    // Usa o StudentsService para buscar e validar o aluno
    private readonly studentsService: StudentsService,
  ) {}

  /**
   * Cria uma nova matrícula vinculando aluno a um plano.
   * Regras aplicadas:
   * - Aluno deve existir no tenant
   * - Plano deve existir no tenant
   * - Aluno não pode ter matrícula ativa no mesmo plano
   * - Data de vencimento é calculada automaticamente
   */
  async create(dto: CreateEnrollmentDto, tenantId: string) {
    // Valida se o aluno existe no tenant
    const student = await this.studentsService.findOne(dto.studentId, tenantId);

    // Valida se o plano existe no tenant
    const plan = await this.plansService.findOne(dto.planId, tenantId);

    // Verifica se já existe matrícula ativa para o mesmo aluno e plano
    const existing = await this.enrollmentRepository.findOne({
      where: {
        studentId: dto.studentId,
        planId: dto.planId,
        tenantId,
        status: EnrollmentStatus.ACTIVE,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Aluno já possui matrícula ativa neste plano',
      );
    }

    // Calcula a data de vencimento somando os dias do plano à data de início
    const startDate = new Date(dto.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    // Cria a matrícula com todos os dados calculados
    const enrollment = this.enrollmentRepository.create({
      ...dto,
      tenantId,
      endDate,
      status: dto.status ?? EnrollmentStatus.ACTIVE,
    });

    return this.enrollmentRepository.save(enrollment);
  }

  /**
   * Lista todas as matrículas do tenant.
   * Filtra opcionalmente por status.
   * Retorna os dados do aluno e plano vinculados.
   */
  async findAll(tenantId: string, status?: string) {
    const where: any = { tenantId };
    if (status) where.status = status;

    return this.enrollmentRepository.find({
      where,
      // Carrega os dados do aluno e plano junto com a matrícula
      relations: ['student', 'plan'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Busca uma matrícula específica pelo ID dentro do tenant.
   * Lança NotFoundException se não encontrada.
   */
  async findOne(id: string, tenantId: string) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id, tenantId },
      relations: ['student', 'plan'],
    });

    if (!enrollment) {
      throw new NotFoundException('Matrícula não encontrada');
    }

    return enrollment;
  }

  /**
   * Busca todas as matrículas de um aluno específico.
   */
  async findByStudent(studentId: string, tenantId: string) {
    return this.enrollmentRepository.find({
      where: { studentId, tenantId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Atualiza uma matrícula existente.
   * Permite alterar status, motivo de cancelamento, observações e bloqueio.
   */
  async update(id: string, dto: UpdateEnrollmentDto, tenantId: string) {
    const enrollment = await this.findOne(id, tenantId);

    // Impede reativar matrícula cancelada diretamente
    if (
      enrollment.status === EnrollmentStatus.CANCELLED &&
      dto.status === EnrollmentStatus.ACTIVE
    ) {
      throw new BadRequestException(
        'Matrícula cancelada não pode ser reativada diretamente. Crie uma nova matrícula.',
      );
    }

    Object.assign(enrollment, dto);
    return this.enrollmentRepository.save(enrollment);
  }

  /**
   * Cancela uma matrícula com motivo obrigatório.
   */
  async cancel(id: string, reason: string, tenantId: string) {
    const enrollment = await this.findOne(id, tenantId);

    if (enrollment.status === EnrollmentStatus.CANCELLED) {
      throw new BadRequestException('Matrícula já está cancelada');
    }

    enrollment.status = EnrollmentStatus.CANCELLED;
    enrollment.cancellationReason = reason;

    return this.enrollmentRepository.save(enrollment);
  }
}
