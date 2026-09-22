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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

/**
 * StudentsController
 * Permissões:
 * - GET: admin, recepção, financeiro (consulta), professor (consulta)
 * - POST/PATCH: admin, recepção
 * - DELETE: apenas admin
 */
@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  /** POST /students — Criar aluno — admin e recepção */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Criar aluno' })
  create(@Body() dto: CreateStudentDto, @Request() req) {
    return this.studentsService.create(dto, req.user.tenantId);
  }

  /** GET /students — Listar alunos — todos os roles */
  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.RECEPTIONIST,
    UserRole.FINANCIAL,
    UserRole.TEACHER,
  )
  @ApiOperation({ summary: 'Listar alunos' })
  findAll(@Request() req, @Query('status') status?: string) {
    return this.studentsService.findAll(req.user.tenantId, status);
  }

  /** GET /students/:id — Buscar aluno — todos os roles */
  @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.RECEPTIONIST,
    UserRole.FINANCIAL,
    UserRole.TEACHER,
  )
  @ApiOperation({ summary: 'Buscar aluno por ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.studentsService.findOne(id, req.user.tenantId);
  }

  /** PATCH /students/:id — Atualizar aluno — admin e recepção */
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Atualizar aluno' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
    @Request() req,
  ) {
    return this.studentsService.update(id, dto, req.user.tenantId);
  }

  /** DELETE /students/:id — Remover aluno — apenas admin */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover aluno (soft delete)' })
  remove(@Param('id') id: string, @Request() req) {
    return this.studentsService.remove(id, req.user.tenantId);
  }
}
