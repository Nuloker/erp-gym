import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { Enrollment } from './entities/enrollment.entity';
import { PlansModule } from '../plans/plans.module';
import { StudentsModule } from '../students/students.module';

/**
 * EnrollmentsModule
 * Módulo responsável pela gestão de matrículas.
 *
 * Importa PlansModule e StudentsModule para poder
 * validar aluno e plano durante a criação da matrícula.
 * Os services desses módulos são injetados via exports.
 */
@Module({
  imports: [
    // Registra a entidade Enrollment no TypeORM
    TypeOrmModule.forFeature([Enrollment]),

    // Importa PlansModule para usar o PlansService
    PlansModule,

    // Importa StudentsModule para usar o StudentsService
    StudentsModule,
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
