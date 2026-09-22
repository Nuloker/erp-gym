import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

/**
 * AuditService
 * Responsável por registrar e consultar logs de auditoria.
 *
 * Usado pelo AuditInterceptor para persistir automaticamente
 * todas as ações críticas do sistema.
 */
@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Registra uma ação no log de auditoria.
   * Chamado automaticamente pelo AuditInterceptor.
   */
  async log(data: Partial<AuditLog>): Promise<void> {
    try {
      const log = this.auditLogRepository.create(data);
      await this.auditLogRepository.save(log);
    } catch (error) {
      // Nunca deixa o log quebrar a requisição principal
      console.error('Erro ao registrar audit log:', error);
    }
  }

  /**
   * Lista todos os logs do tenant com paginação.
   * Ordenado por data decrescente — mais recentes primeiro.
   */
  async findAll(
    tenantId: string,
    limit = 100,
    offset = 0,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const [logs, total] = await this.auditLogRepository.findAndCount({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { logs, total };
  }

  /**
   * Lista logs de um usuário específico.
   */
  async findByUser(userId: string, tenantId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId, tenantId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
