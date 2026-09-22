import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * DashboardController
 * Camada HTTP do módulo de dashboard.
 * Expõe um único endpoint que retorna todos os
 * indicadores gerenciais do tenant autenticado.
 */
@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/summary
   * Retorna todos os indicadores gerenciais do tenant.
   * Agrega dados de alunos, matrículas, financeiro e frequência.
   */
  @Get('summary')
  @ApiOperation({ summary: 'Indicadores gerenciais do dashboard' })
  getSummary(@Request() req) {
    return this.dashboardService.getSummary(req.user.tenantId);
  }
}
