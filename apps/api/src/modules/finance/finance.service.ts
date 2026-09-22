import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { Payment } from './entities/payment.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

/**
 * FinanceService
 * Camada de regras de negócio do módulo financeiro.
 * Gerencia cobranças (invoices) e pagamentos (payments).
 *
 * Regras principais:
 * - Todos os campos numéricos são convertidos explicitamente
 *   para number via Number() para evitar problemas com strings
 *   vindas do frontend ou do banco de dados
 * - Ao registrar pagamento, verifica se invoice foi quitada
 * - Invoice quitada tem status atualizado para PAID automaticamente
 * - Pagamento não pode exceder o valor total da cobrança
 * - Todas as operações são isoladas por tenantId
 */
@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  /**
   * Cria uma nova cobrança para um aluno.
   * Converte explicitamente os campos numéricos para number
   * pois podem chegar como string do frontend.
   */
  async createInvoice(dto: CreateInvoiceDto, tenantId: string) {
    const invoice = this.invoiceRepository.create({
      ...dto,
      tenantId,
      status: dto.status ?? InvoiceStatus.PENDING,

      // Converte campos monetários de string para number
      // evitando que sejam salvos como 0 ou NaN no banco
      amount: Number(dto.amount),
      discount: Number(dto.discount ?? 0),
      fine: 0,
      interest: 0,
    });

    return this.invoiceRepository.save(invoice);
  }

  /**
   * Lista todas as cobranças do tenant.
   * Filtra opcionalmente por status e studentId.
   * Retorna dados do aluno e pagamentos vinculados.
   */
  async findAllInvoices(tenantId: string, status?: string, studentId?: string) {
    // Atualiza automaticamente as cobranças vencidas
    await this.invoiceRepository
      .createQueryBuilder()
      .update(Invoice)
      .set({ status: InvoiceStatus.OVERDUE })
      .where('tenantId = :tenantId', { tenantId })
      .andWhere('status = :status', { status: InvoiceStatus.PENDING })
      .andWhere('dueDate < CURRENT_DATE')
      .execute();

    const where: any = { tenantId };

    if (status) where.status = status;
    if (studentId) where.studentId = studentId;

    return this.invoiceRepository.find({
      where,
      relations: ['student', 'payments'],
      order: { dueDate: 'ASC' },
    });
  }

  /**
   * Busca uma cobrança específica pelo ID.
   * Retorna aluno, matrícula e pagamentos vinculados.
   */
  async findOneInvoice(id: string, tenantId: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, tenantId },
      relations: ['student', 'enrollment', 'payments'],
    });

    if (!invoice) {
      throw new NotFoundException('Cobrança não encontrada');
    }

    return invoice;
  }

  /**
   * Atualiza dados de uma cobrança existente.
   * Permite alterar status, descontos, multas e juros.
   */
  async updateInvoice(id: string, dto: UpdateInvoiceDto, tenantId: string) {
    const invoice = await this.findOneInvoice(id, tenantId);
    Object.assign(invoice, dto);
    return this.invoiceRepository.save(invoice);
  }

  /**
   * Registra um pagamento em uma cobrança existente.
   *
   * Regras aplicadas:
   * - Cobrança deve existir e pertencer ao tenant
   * - Cobrança não pode estar cancelada ou já paga
   * - Valor pago não pode exceder o saldo devedor
   * - Se valor total for quitado, status é atualizado para PAID
   *
   * Todos os valores são convertidos via Number() para garantir
   * que operações aritméticas funcionem corretamente mesmo
   * quando os valores vierem como string do banco ou frontend.
   */
  async createPayment(dto: CreatePaymentDto, tenantId: string, userId: string) {
    // Busca a cobrança com seus pagamentos existentes
    const invoice = await this.findOneInvoice(dto.invoiceId, tenantId);

    // Impede pagamento em cobrança cancelada
    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException(
        'Cobrança cancelada não pode receber pagamentos',
      );
    }

    // Impede pagamento em cobrança já quitada
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cobrança já está quitada');
    }

    // Converte todos os campos monetários para number
    // garantindo que operações aritméticas sejam corretas
    const amount = Number(invoice.amount);
    const discount = Number(invoice.discount ?? 0);
    const fine = Number(invoice.fine ?? 0);
    const interest = Number(invoice.interest ?? 0);

    // Calcula o valor total da cobrança com ajustes financeiros
    const totalAmount = amount - discount + fine + interest;

    // Calcula o total já pago somando todos os pagamentos anteriores
    const totalPaid = (invoice.payments ?? []).reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    // Calcula o saldo devedor restante
    const remaining = parseFloat((totalAmount - totalPaid).toFixed(2));

    // Converte o valor do pagamento recebido para number
    const paymentAmount = Number(dto.amount);

    // Impede pagamento maior que o saldo devedor
    if (paymentAmount > remaining) {
      throw new BadRequestException(
        `Valor do pagamento (${paymentAmount}) excede o saldo devedor (${remaining})`,
      );
    }

    // Cria o registro de pagamento
    const payment = this.paymentRepository.create({
      invoiceId: dto.invoiceId,
      tenantId,
      amount: paymentAmount,
      method: dto.method,
      paymentDate: dto.paymentDate,
      observations: dto.observations,
      receivedBy: userId,
    });

    await this.paymentRepository.save(payment);

    // Verifica se a cobrança foi totalmente quitada
    // Usa update direto em vez de save para evitar cascade
    const newTotalPaid = totalPaid + paymentAmount;
    if (newTotalPaid >= totalAmount) {
      await this.invoiceRepository.update(
        { id: invoice.id },
        { status: InvoiceStatus.PAID },
      );
    }

    return payment;
  }

  /**
   * Lista todos os pagamentos de uma cobrança específica.
   */
  async findPaymentsByInvoice(invoiceId: string, tenantId: string) {
    // Valida se a cobrança existe no tenant
    await this.findOneInvoice(invoiceId, tenantId);

    return this.paymentRepository.find({
      where: { invoiceId, tenantId },
      order: { paymentDate: 'DESC' },
    });
  }

  /**
   * Retorna um resumo financeiro do tenant.
   * Usado no dashboard para exibir receitas e inadimplência.
   */
  async getSummary(tenantId: string) {
    // Total de cobranças pendentes
    const pending = await this.invoiceRepository.count({
      where: { tenantId, status: InvoiceStatus.PENDING },
    });

    // Total de cobranças vencidas (inadimplentes)
    const overdue = await this.invoiceRepository.count({
      where: { tenantId, status: InvoiceStatus.OVERDUE },
    });

    // Total de cobranças pagas
    const paid = await this.invoiceRepository.count({
      where: { tenantId, status: InvoiceStatus.PAID },
    });

    return { pending, overdue, paid };
  }
}
