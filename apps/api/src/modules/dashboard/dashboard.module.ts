import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Student } from '../students/entities/student.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Invoice } from '../finance/entities/invoice.entity';
import { Attendance } from '../attendance/entities/attendance.entity';

/**
 * DashboardModule
 * Módulo responsável pelos indicadores gerenciais.
 *
 * Importa diretamente as entidades dos outros módulos
 * via TypeOrmModule.forFeature para fazer queries agregadas
 * sem depender dos services de cada módulo individualmente.
 */
@Module({
  imports: [
    // Registra as entidades necessárias para as queries do dashboard
    TypeOrmModule.forFeature([Student, Enrollment, Invoice, Attendance]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
