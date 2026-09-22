import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { StudentsService } from '../students/students.service';
import { StudentStatus } from '../students/entities/student.entity';

/**
 * AttendanceService
 * Camada de regras de negócio do módulo de presença.
 *
 * Regras principais:
 * - Aluno deve existir e estar ativo no tenant
 * - Aluno bloqueado não pode fazer check-in
 * - Se checkedInAt não informado, usa data/hora atual
 * - Histórico de frequência filtrado por aluno e período
 */
@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    // Usa StudentsService para validar o aluno antes do check-in
    private readonly studentsService: StudentsService,
  ) {}

  /**
   * Registra um check-in de aluno.
   * Valida se o aluno existe, está ativo e não está bloqueado.
   */
  async create(dto: CreateAttendanceDto, tenantId: string, userId: string) {
    // Busca o aluno e valida que pertence ao tenant
    const student = await this.studentsService.findOne(dto.studentId, tenantId);

    // Impede check-in de aluno inativo ou cancelado
    if (
      student.status === StudentStatus.BLOCKED ||
      student.status === StudentStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Aluno com status "${student.status}" não pode realizar check-in`,
      );
    }

    // Usa a data/hora informada ou o momento atual
    const checkedInAt = dto.checkedInAt
      ? new Date(dto.checkedInAt)
      : new Date();

    const attendance = this.attendanceRepository.create({
      studentId: dto.studentId,
      tenantId,
      checkedInAt,
      observations: dto.observations,
      registeredBy: userId, // registra quem fez o check-in
    });

    return this.attendanceRepository.save(attendance);
  }

  /**
   * Lista todos os check-ins do tenant.
   * Filtra opcionalmente por studentId, data início e data fim.
   */
  async findAll(
    tenantId: string,
    studentId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = { tenantId };

    // Filtra por aluno específico se informado
    if (studentId) where.studentId = studentId;

    // Filtra por período se ambas as datas forem informadas
    if (startDate && endDate) {
      where.checkedInAt = Between(
        new Date(startDate),
        new Date(endDate + 'T23:59:59'),
      );
    }

    return this.attendanceRepository.find({
      where,
      relations: ['student'], // carrega dados do aluno junto
      order: { checkedInAt: 'DESC' },
    });
  }

  /**
   * Retorna o histórico de frequência de um aluno específico.
   * Inclui contagem total de check-ins.
   */
  async findByStudent(studentId: string, tenantId: string) {
    // Valida se o aluno existe no tenant
    await this.studentsService.findOne(studentId, tenantId);

    const records = await this.attendanceRepository.find({
      where: { studentId, tenantId },
      order: { checkedInAt: 'DESC' },
    });

    return {
      studentId,
      totalCheckIns: records.length, // total de presenças do aluno
      records,
    };
  }
}
