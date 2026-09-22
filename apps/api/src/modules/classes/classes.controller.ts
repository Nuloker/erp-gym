import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { ClassesService } from './classes.service';
import { CreateModalityDto } from './dto/create-modality.dto';
import { UpdateModalityDto } from './dto/update-modality.dto';
import { CreateClassGroupDto } from './dto/create-class-group.dto';
import { CreateClassScheduleDto } from './dto/create-class-schedule.dto';
import { UpdateClassGroupDto } from './dto/update-class-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * ClassesController
 * Camada HTTP do módulo de turmas e aulas.
 *
 * Expõe endpoints para gerenciar:
 * - Modalidades (Musculação, Funcional, Spinning, etc.)
 * - Turmas (grupos de alunos por modalidade)
 * - Horários recorrentes de cada turma
 * - Inscrições de alunos nas turmas
 *
 * Todas as rotas exigem autenticação JWT.
 * Todas as operações são isoladas por tenantId via req.user.
 */
@ApiTags('Classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  // ── MODALIDADES ──────────────────────────────────────────

  /** POST /classes/modalities — Cria uma nova modalidade */
  @Post('modalities')
  @ApiOperation({ summary: 'Criar modalidade' })
  createModality(@Body() dto: CreateModalityDto, @Request() req) {
    return this.classesService.createModality(dto, req.user.tenantId);
  }

  /** GET /classes/modalities — Lista todas as modalidades */
  @Get('modalities')
  @ApiOperation({ summary: 'Listar modalidades' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAllModalities(@Request() req, @Query('isActive') isActive?: string) {
    const active = isActive !== undefined ? isActive === 'true' : undefined;
    return this.classesService.findAllModalities(req.user.tenantId, active);
  }

  /** PATCH /classes/modalities/:id — Atualiza uma modalidade */
  @Patch('modalities/:id')
  @ApiOperation({ summary: 'Atualizar modalidade' })
  updateModality(
    @Param('id') id: string,
    @Body() dto: UpdateModalityDto,
    @Request() req,
  ) {
    return this.classesService.updateModality(id, dto, req.user.tenantId);
  }

  /** DELETE /classes/modalities/:id — Remove uma modalidade */
  @Delete('modalities/:id')
  @ApiOperation({ summary: 'Remover modalidade' })
  removeModality(@Param('id') id: string, @Request() req) {
    return this.classesService.removeModality(id, req.user.tenantId);
  }

  // ── TURMAS ───────────────────────────────────────────────

  /** POST /classes/groups — Cria uma nova turma */
  @Post('groups')
  @ApiOperation({ summary: 'Criar turma' })
  createClassGroup(@Body() dto: CreateClassGroupDto, @Request() req) {
    return this.classesService.createClassGroup(dto, req.user.tenantId);
  }

  /** GET /classes/groups — Lista todas as turmas */
  @Get('groups')
  @ApiOperation({ summary: 'Listar turmas' })
  findAllClassGroups(@Request() req) {
    return this.classesService.findAllClassGroups(req.user.tenantId);
  }

  /** GET /classes/groups/:id — Busca uma turma específica */
  @Get('groups/:id')
  @ApiOperation({ summary: 'Buscar turma por ID' })
  findOneClassGroup(@Param('id') id: string, @Request() req) {
    return this.classesService.findOneClassGroup(id, req.user.tenantId);
  }

  /** PATCH /classes/groups/:id — Atualiza uma turma */
  @Patch('groups/:id')
  @ApiOperation({ summary: 'Atualizar turma' })
  updateClassGroup(
    @Param('id') id: string,
    @Body() dto: UpdateClassGroupDto,
    @Request() req,
  ) {
    return this.classesService.updateClassGroup(id, dto, req.user.tenantId);
  }

  /** DELETE /classes/groups/:id — Remove uma turma */
  @Delete('groups/:id')
  @ApiOperation({ summary: 'Remover turma' })
  removeClassGroup(@Param('id') id: string, @Request() req) {
    return this.classesService.removeClassGroup(id, req.user.tenantId);
  }

  // ── HORÁRIOS ─────────────────────────────────────────────

  /** POST /classes/schedules — Adiciona horário a uma turma */
  @Post('schedules')
  @ApiOperation({ summary: 'Adicionar horário à turma' })
  createSchedule(@Body() dto: CreateClassScheduleDto, @Request() req) {
    return this.classesService.createSchedule(dto, req.user.tenantId);
  }

  /** DELETE /classes/schedules/:id — Remove um horário */
  @Delete('schedules/:id')
  @ApiOperation({ summary: 'Remover horário' })
  removeSchedule(@Param('id') id: string, @Request() req) {
    return this.classesService.removeSchedule(id, req.user.tenantId);
  }

  // ── INSCRIÇÕES ───────────────────────────────────────────

  /** POST /classes/groups/:id/enroll — Inscreve aluno na turma */
  @Post('groups/:id/enroll')
  @ApiOperation({ summary: 'Inscrever aluno na turma' })
  enrollStudent(
    @Param('id') classGroupId: string,
    @Body('studentId') studentId: string,
    @Request() req,
  ) {
    return this.classesService.enrollStudent(
      classGroupId,
      studentId,
      req.user.tenantId,
    );
  }

  /** DELETE /classes/groups/:id/unenroll/:studentId — Remove aluno da turma */
  @Delete('groups/:id/unenroll/:studentId')
  @ApiOperation({ summary: 'Remover aluno da turma' })
  unenrollStudent(
    @Param('id') classGroupId: string,
    @Param('studentId') studentId: string,
    @Request() req,
  ) {
    return this.classesService.unenrollStudent(
      classGroupId,
      studentId,
      req.user.tenantId,
    );
  }
}
