import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { PhysicalAssessment } from './entities/physical-assessment.entity';

/**
 * AssessmentsModule
 * Módulo de avaliações físicas.
 * Registra a entidade PhysicalAssessment e expõe
 * controller e service para o restante da aplicação.
 */
@Module({
  imports: [TypeOrmModule.forFeature([PhysicalAssessment])],
  controllers: [AssessmentsController],
  providers: [AssessmentsService],
  exports: [AssessmentsService],
})
export class AssessmentsModule {}
