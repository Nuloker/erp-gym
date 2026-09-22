import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student, StudentStatus } from '../students/entities/student.entity';
import {
  Enrollment,
  EnrollmentStatus,
} from '../enrollments/entities/enrollment.entity';
import { Invoice, InvoiceStatus } from '../finance/entities/invoice.entity';
import { Attendance } from '../attendance/entities/attendance.entity';

/**
 * DashboardService
 * Camada de regras de negócio do módulo de dashboard.
 * Agrega dados de múltiplos módulos para gerar os
 * indicadores gerenciais exibidos na tela principal.
 *
 * Todos os dados são filtrados por tenantId (multi-tenant).
 */
@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,

    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  /**
   * Retorna todos os indicadores do dashboard em uma única chamada.
   * Agrega dados de alunos, matrículas, financeiro e frequência.
   */
  async getSummary(tenantId: string) {
    // ── ALUNOS ──────────────────────────────────────────────
    // Total de alunos ativos no tenant
    const activeStudents = await this.studentRepository.count({
      where: { tenantId, status: StudentStatus.ACTIVE },
    });

    // Total de alunos com status pendente
    const pendingStudents = await this.studentRepository.count({
      where: { tenantId, status: StudentStatus.PENDING },
    });

    // Total de alunos cancelados
    const cancelledStudents = await this.studentRepository.count({
      where: { tenantId, status: StudentStatus.CANCELLED },
    });

    // ── MATRÍCULAS ───────────────────────────────────────────
    // Total de matrículas ativas
    const activeEnrollments = await this.enrollmentRepository.count({
      where: { tenantId, status: EnrollmentStatus.ACTIVE },
    });

    // Total de matrículas novas no mês atual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const newEnrollmentsThisMonth = await this.enrollmentRepository
      .createQueryBuilder('e')
      .where('e.tenantId = :tenantId', { tenantId })
      .andWhere('e.createdAt >= :firstDay', { firstDay: firstDayOfMonth })
      .getCount();

    // ── FINANCEIRO ───────────────────────────────────────────
    // Total de cobranças pendentes (a receber)
    const pendingInvoices = await this.invoiceRepository.count({
      where: { tenantId, status: InvoiceStatus.PENDING },
    });

    // Total de cobranças vencidas (inadimplentes)
    const overdueInvoices = await this.invoiceRepository.count({
      where: { tenantId, status: InvoiceStatus.OVERDUE },
    });

    // Soma total de cobranças pagas no mês atual
    const paidThisMonth = await this.invoiceRepository
      .createQueryBuilder('i')
      .select('SUM(i.amount - i.discount + i.fine + i.interest)', 'total')
      .where('i.tenantId = :tenantId', { tenantId })
      .andWhere('i.status = :status', { status: InvoiceStatus.PAID })
      .andWhere('i.updatedAt >= :firstDay', { firstDay: firstDayOfMonth })
      .getRawOne<{ total: string | null }>();

    // ── FREQUÊNCIA ───────────────────────────────────────────
    // Total de check-ins realizados hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkInsToday = await this.attendanceRepository
      .createQueryBuilder('a')
      .where('a.tenantId = :tenantId', { tenantId })
      .andWhere('a.checkedInAt >= :today', { today })
      .andWhere('a.checkedInAt < :tomorrow', { tomorrow })
      .getCount();

    // Total de check-ins no mês atual
    const checkInsThisMonth = await this.attendanceRepository
      .createQueryBuilder('a')
      .where('a.tenantId = :tenantId', { tenantId })
      .andWhere('a.checkedInAt >= :firstDay', { firstDay: firstDayOfMonth })
      .getCount();

    // Retorna todos os indicadores organizados por categoria
    return {
      students: {
        active: activeStudents, // alunos ativos
        pending: pendingStudents, // alunos pendentes
        cancelled: cancelledStudents, // alunos cancelados
      },
      enrollments: {
        active: activeEnrollments, // matrículas ativas
        newThisMonth: newEnrollmentsThisMonth, // novas no mês
      },
      finance: {
        pendingInvoices, // cobranças a receber
        overdueInvoices, // inadimplentes
        revenueThisMonth: Number(paidThisMonth?.total ?? 0), // receita do mês
      },
      attendance: {
        checkInsToday, // check-ins hoje
        checkInsThisMonth, // check-ins no mês
      },
    };
  }
}
