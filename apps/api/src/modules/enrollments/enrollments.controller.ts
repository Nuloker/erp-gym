import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

/**
 * EnrollmentsController
 * Permissões:
 * - GET: admin, recepção, financeiro (consulta), professor (consulta)
 * - POST/PATCH: admin, recepção
 * - cancel: admin, recepção
 */
@ApiTags('Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  /** POST /enrollments — Criar matrícula — admin e recepção */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Criar matrícula' })
  create(@Body() dto: CreateEnrollmentDto, @Request() req) {
    return this.enrollmentsService.create(dto, req.user.tenantId);
  }

  /** GET /enrollments — Listar matrículas — todos exceto professor */
  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.RECEPTIONIST,
    UserRole.FINANCIAL,
    UserRole.TEACHER,
  )
  @ApiOperation({ summary: 'Listar matrículas' })
  @ApiQuery({ name: 'status', required: false })
  findAll(@Request() req, @Query('status') status?: string) {
    return this.enrollmentsService.findAll(req.user.tenantId, status);
  }

  /** GET /enrollments/student/:studentId — Por aluno — todos os roles */
  @Get('student/:studentId')
  @Roles(
    UserRole.ADMIN,
    UserRole.RECEPTIONIST,
    UserRole.FINANCIAL,
    UserRole.TEACHER,
  )
  @ApiOperation({ summary: 'Listar matrículas por aluno' })
  findByStudent(@Param('studentId') studentId: string, @Request() req) {
    return this.enrollmentsService.findByStudent(studentId, req.user.tenantId);
  }

  /** GET /enrollments/:id — Buscar matrícula — todos os roles */
  @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.RECEPTIONIST,
    UserRole.FINANCIAL,
    UserRole.TEACHER,
  )
  @ApiOperation({ summary: 'Buscar matrícula por ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.enrollmentsService.findOne(id, req.user.tenantId);
  }

  /** PATCH /enrollments/:id — Atualizar matrícula — admin e recepção */
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Atualizar matrícula' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEnrollmentDto,
    @Request() req,
  ) {
    return this.enrollmentsService.update(id, dto, req.user.tenantId);
  }

  /** PATCH /enrollments/:id/cancel — Cancelar — admin e recepção */
  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Cancelar matrícula' })
  cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.enrollmentsService.cancel(id, reason, req.user.tenantId);
  }
}
