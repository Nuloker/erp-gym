import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * AuditController
 * Expõe endpoints para consulta dos logs de auditoria.
 * Apenas leitura — logs são criados automaticamente pelo interceptor.
 * Todas as rotas exigem autenticação JWT.
 */
@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * GET /audit/logs
   * Lista logs de auditoria do tenant com paginação.
   */
  @Get('logs')
  @ApiOperation({ summary: 'Listar logs de auditoria' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAll(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.auditService.findAll(
      req.user.tenantId,
      limit ? parseInt(limit) : 100,
      offset ? parseInt(offset) : 0,
    );
  }

  /**
   * GET /audit/logs/user/:userId
   * Lista logs de um usuário específico.
   */
  @Get('logs/me')
  @ApiOperation({ summary: 'Listar meus logs de auditoria' })
  findMine(@Request() req) {
    return this.auditService.findByUser(req.user.id, req.user.tenantId);
  }
}
