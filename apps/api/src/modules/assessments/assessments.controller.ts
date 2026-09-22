import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AssessmentsService } from './assessments.service';
import { CreatePhysicalAssessmentDto } from './dto/create-physical-assessment.dto';
import { UpdatePhysicalAssessmentDto } from './dto/update-physical-assessment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

/**
 * AssessmentsController
 * Permissões:
 * - GET: admin, professor, recepção
 * - POST/PATCH/DELETE: admin, professor, recepção
 * financeiro não tem acesso a avaliações
 */
@ApiTags('Assessments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  /** POST /assessments — admin, professor, recepção */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Criar avaliação física' })
  create(@Body() dto: CreatePhysicalAssessmentDto, @Request() req) {
    return this.assessmentsService.create(dto, req.user.tenantId);
  }

  /** GET /assessments — admin, professor, recepção */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Listar avaliações do tenant' })
  findAll(@Request() req) {
    return this.assessmentsService.findAll(req.user.tenantId);
  }

  /** GET /assessments/student/:studentId — admin, professor, recepção */
  @Get('student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Listar avaliações de um aluno' })
  findByStudent(@Param('studentId') studentId: string, @Request() req) {
    return this.assessmentsService.findByStudent(studentId, req.user.tenantId);
  }

  /** GET /assessments/:id — admin, professor, recepção */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Buscar avaliação por ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.assessmentsService.findOne(id, req.user.tenantId);
  }

  /** PATCH /assessments/:id — admin, professor */
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Atualizar avaliação física' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePhysicalAssessmentDto,
    @Request() req,
  ) {
    return this.assessmentsService.update(id, dto, req.user.tenantId);
  }

  /** DELETE /assessments/:id — apenas admin */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover avaliação física' })
  remove(@Param('id') id: string, @Request() req) {
    return this.assessmentsService.remove(id, req.user.tenantId);
  }
}
