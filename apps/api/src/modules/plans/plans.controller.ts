import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

/**
 * PlansController
 * Permissões:
 * - GET: admin, recepção (consulta), financeiro (consulta)
 * - POST/PATCH/DELETE: apenas admin
 */
@ApiTags('Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  /** POST /plans — Criar plano — apenas admin */
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar plano' })
  create(@Body() dto: CreatePlanDto, @Request() req) {
    return this.plansService.create(dto, req.user.tenantId);
  }

  /** GET /plans — Listar planos — admin, recepção, financeiro */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.FINANCIAL)
  @ApiOperation({ summary: 'Listar planos' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(@Request() req, @Query('isActive') isActive?: string) {
    const active = isActive !== undefined ? isActive === 'true' : undefined;
    return this.plansService.findAll(req.user.tenantId, active);
  }

  /** GET /plans/:id — Buscar plano — admin, recepção, financeiro */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.FINANCIAL)
  @ApiOperation({ summary: 'Buscar plano por ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.plansService.findOne(id, req.user.tenantId);
  }

  /** PATCH /plans/:id — Atualizar plano — apenas admin */
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar plano' })
  update(@Param('id') id: string, @Body() dto: UpdatePlanDto, @Request() req) {
    return this.plansService.update(id, dto, req.user.tenantId);
  }

  /** DELETE /plans/:id — Remover plano — apenas admin */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover plano' })
  remove(@Param('id') id: string, @Request() req) {
    return this.plansService.remove(id, req.user.tenantId);
  }
}
