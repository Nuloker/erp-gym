import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

/**
 * FinanceController
 * Permissões:
 * - GET: admin, recepção (baixa controlada), financeiro (total)
 * - POST invoice: admin, financeiro, recepção
 * - POST payment (baixa): admin, financeiro, recepção
 * - PATCH invoice: admin, financeiro
 * - summary: admin, financeiro
 */
@ApiTags('Finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  /** POST /finance/invoices — Criar cobrança — admin, financeiro, recepção */
  @Post('invoices')
  @Roles(UserRole.ADMIN, UserRole.FINANCIAL, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Criar cobrança' })
  createInvoice(@Body() dto: CreateInvoiceDto, @Request() req) {
    return this.financeService.createInvoice(dto, req.user.tenantId);
  }

  /** GET /finance/invoices — Listar cobranças — admin, financeiro, recepção */
  @Get('invoices')
  @Roles(UserRole.ADMIN, UserRole.FINANCIAL, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Listar cobranças' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'studentId', required: false })
  findAllInvoices(
    @Request() req,
    @Query('status') status?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.financeService.findAllInvoices(
      req.user.tenantId,
      status,
      studentId,
    );
  }

  /** GET /finance/invoices/summary — Resumo financeiro — admin, financeiro */
  @Get('invoices/summary')
  @Roles(UserRole.ADMIN, UserRole.FINANCIAL)
  @ApiOperation({ summary: 'Resumo financeiro' })
  getSummary(@Request() req) {
    return this.financeService.getSummary(req.user.tenantId);
  }

  /** GET /finance/invoices/:id — Buscar cobrança — admin, financeiro, recepção */
  @Get('invoices/:id')
  @Roles(UserRole.ADMIN, UserRole.FINANCIAL, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Buscar cobrança por ID' })
  findOneInvoice(@Param('id') id: string, @Request() req) {
    return this.financeService.findOneInvoice(id, req.user.tenantId);
  }

  /** PATCH /finance/invoices/:id — Atualizar cobrança — admin, financeiro */
  @Patch('invoices/:id')
  @Roles(UserRole.ADMIN, UserRole.FINANCIAL)
  @ApiOperation({ summary: 'Atualizar cobrança' })
  updateInvoice(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
    @Request() req,
  ) {
    return this.financeService.updateInvoice(id, dto, req.user.tenantId);
  }

  /** POST /finance/payments — Registrar pagamento — admin, financeiro, recepção */
  @Post('payments')
  @Roles(UserRole.ADMIN, UserRole.FINANCIAL, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Registrar pagamento' })
  createPayment(@Body() dto: CreatePaymentDto, @Request() req) {
    return this.financeService.createPayment(
      dto,
      req.user.tenantId,
      req.user.id,
    );
  }

  /** GET /finance/payments/invoice/:invoiceId — admin, financeiro, recepção */
  @Get('payments/invoice/:invoiceId')
  @Roles(UserRole.ADMIN, UserRole.FINANCIAL, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Listar pagamentos de uma cobrança' })
  findPaymentsByInvoice(@Param('invoiceId') invoiceId: string, @Request() req) {
    return this.financeService.findPaymentsByInvoice(
      invoiceId,
      req.user.tenantId,
    );
  }
}
