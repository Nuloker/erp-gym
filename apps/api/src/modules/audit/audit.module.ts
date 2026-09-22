import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditInterceptor } from './audit.interceptor';

/**
 * AuditModule
 * Módulo global de auditoria.
 *
 * Marcado como @Global para que o AuditService e AuditInterceptor
 * possam ser injetados em qualquer módulo sem necessidade de reimportar.
 *
 * O AuditInterceptor é registrado globalmente no AppModule
 * via APP_INTERCEPTOR para capturar todas as requisições.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditController],
  providers: [AuditService, AuditInterceptor],
  exports: [AuditService, AuditInterceptor],
})
export class AuditModule {}
