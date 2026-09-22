import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { Invoice } from './entities/invoice.entity';
import { Payment } from './entities/payment.entity';

/**
 * FinanceModule
 * Módulo responsável pela gestão financeira da academia.
 *
 * Registra as entidades Invoice e Payment no TypeORM.
 * Exporta o FinanceService para uso em outros módulos
 * como Dashboard e Relatórios.
 */
@Module({
  imports: [
    // Registra Invoice e Payment — cria os repositórios automaticamente
    TypeOrmModule.forFeature([Invoice, Payment]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
