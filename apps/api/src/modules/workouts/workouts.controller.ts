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
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { CreateWorkoutExerciseDto } from './dto/create-workout-exercise.dto';
import { UpdateWorkoutExerciseDto } from './dto/update-workout-exercise.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

/**
 * WorkoutsController
 * Permissões:
 * - GET: admin, professor, recepção (consulta)
 * - POST/PATCH/DELETE planos e exercícios: admin, professor
 */
@ApiTags('Workouts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  // ── FICHAS DE TREINO ─────────────────────────────────────

  /** POST /workouts/plans — Criar ficha — admin, professor */
  @Post('plans')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Criar ficha de treino' })
  createPlan(@Body() dto: CreateWorkoutPlanDto, @Request() req) {
    return this.workoutsService.createWorkoutPlan(dto, req.user.tenantId);
  }

  /** GET /workouts/plans — Listar fichas — admin, professor, recepção */
  @Get('plans')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Listar todas as fichas do tenant' })
  findAll(@Request() req) {
    return this.workoutsService.findAll(req.user.tenantId);
  }

  /** GET /workouts/plans/student/:studentId — admin, professor, recepção */
  @Get('plans/student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Listar fichas de um aluno' })
  findByStudent(@Param('studentId') studentId: string, @Request() req) {
    return this.workoutsService.findByStudent(studentId, req.user.tenantId);
  }

  /** GET /workouts/plans/:id — admin, professor, recepção */
  @Get('plans/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Buscar ficha por ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.workoutsService.findOne(id, req.user.tenantId);
  }

  /** PATCH /workouts/plans/:id — Atualizar ficha — admin, professor */
  @Patch('plans/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Atualizar ficha de treino' })
  updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdateWorkoutPlanDto,
    @Request() req,
  ) {
    return this.workoutsService.updateWorkoutPlan(id, dto, req.user.tenantId);
  }

  /** DELETE /workouts/plans/:id — Remover ficha — admin, professor */
  @Delete('plans/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Remover ficha de treino' })
  removePlan(@Param('id') id: string, @Request() req) {
    return this.workoutsService.removeWorkoutPlan(id, req.user.tenantId);
  }

  // ── EXERCÍCIOS ───────────────────────────────────────────

  /** POST /workouts/exercises — admin, professor */
  @Post('exercises')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Adicionar exercício à ficha' })
  createExercise(@Body() dto: CreateWorkoutExerciseDto, @Request() req) {
    return this.workoutsService.createExercise(dto, req.user.tenantId);
  }

  /** PATCH /workouts/exercises/:id — admin, professor */
  @Patch('exercises/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Atualizar exercício' })
  updateExercise(
    @Param('id') id: string,
    @Body() dto: UpdateWorkoutExerciseDto,
    @Request() req,
  ) {
    return this.workoutsService.updateExercise(id, dto, req.user.tenantId);
  }

  /** DELETE /workouts/exercises/:id — admin, professor */
  @Delete('exercises/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Remover exercício' })
  removeExercise(@Param('id') id: string, @Request() req) {
    return this.workoutsService.removeExercise(id, req.user.tenantId);
  }
}
