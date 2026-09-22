import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { Modality } from './entities/modality.entity';
import { ClassGroup } from './entities/class-group.entity';
import { ClassSchedule } from './entities/class-schedule.entity';
import { ClassEnrollment } from './entities/class-enrollment.entity';

/**
 * ClassesModule
 * Módulo responsável pela gestão de turmas e aulas.
 *
 * Registra as 4 entidades do módulo no TypeORM:
 * - Modality: modalidades de atividade física
 * - ClassGroup: turmas por modalidade
 * - ClassSchedule: horários recorrentes das turmas
 * - ClassEnrollment: inscrições de alunos nas turmas
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Modality,
      ClassGroup,
      ClassSchedule,
      ClassEnrollment,
    ]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
