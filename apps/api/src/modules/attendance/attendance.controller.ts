import {
  Controller,
  Get,
  Post,
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
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

/**
 * AttendanceController
 * Permissões:
 * - POST (check-in): admin, recepção, professor
 * - GET: todos os roles
 */
@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /** POST /attendance — Registrar check-in — admin, recepção, professor */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.TEACHER)
  @ApiOperation({ summary: 'Registrar check-in' })
  create(@Body() dto: CreateAttendanceDto, @Request() req) {
    return this.attendanceService.create(dto, req.user.tenantId, req.user.id);
  }

  /** GET /attendance — Listar check-ins — todos os roles */
  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.RECEPTIONIST,
    UserRole.FINANCIAL,
    UserRole.TEACHER,
  )
  @ApiOperation({ summary: 'Listar check-ins' })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  findAll(
    @Request() req,
    @Query('studentId') studentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.findAll(
      req.user.tenantId,
      studentId,
      startDate,
      endDate,
    );
  }

  /** GET /attendance/student/:studentId — Histórico — todos os roles */
  @Get('student/:studentId')
  @Roles(
    UserRole.ADMIN,
    UserRole.RECEPTIONIST,
    UserRole.FINANCIAL,
    UserRole.TEACHER,
  )
  @ApiOperation({ summary: 'Histórico de frequência por aluno' })
  findByStudent(@Param('studentId') studentId: string, @Request() req) {
    return this.attendanceService.findByStudent(studentId, req.user.tenantId);
  }
}
