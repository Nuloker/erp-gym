import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { Plan } from './entities/plan.entity';

/**
 * PlansModule
 * Módulo responsável pela gestão de planos da academia.
 *
 * Registra a entidade Plan no TypeORM para que o repositório
 * fique disponível via injeção de dependência no PlansService.
 *
 * Exporta o PlansService para que outros módulos como
 * Enrollments possam consultar planos ao criar matrículas.
 */
@Module({
  imports: [
    // Registra a entidade Plan — cria o repositório automaticamente
    TypeOrmModule.forFeature([Plan]),
  ],

  // Controller que recebe as requisições HTTP de /plans
  controllers: [PlansController],

  // Service com as regras de negócio dos planos
  providers: [PlansService],

  // Exporta o service para uso em outros módulos (ex: Enrollments)
  exports: [PlansService],
})
export class PlansModule {}
