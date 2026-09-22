import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Attendance } from './entities/attendance.entity';
import { StudentsModule } from '../students/students.module';

/**
 * AttendanceModule
 * Módulo responsável pelo controle de presença e check-in.
 *
 * Importa StudentsModule para validar o aluno
 * antes de registrar o check-in.
 */
@Module({
  imports: [
    // Registra a entidade Attendance no TypeORM
    TypeOrmModule.forFeature([Attendance]),

    // Importa StudentsModule para usar o StudentsService
    StudentsModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
