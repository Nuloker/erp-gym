import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * AuditLog Entity
 * Registra ações críticas executadas no sistema.
 *
 * Captura automaticamente via interceptor global:
 * - Qual ação foi executada (método HTTP + rota)
 * - Quem executou (userId + email)
 * - Em qual tenant
 * - Quando aconteceu
 * - O resultado da operação (sucesso ou erro)
 * - O payload enviado (para rastreabilidade)
 */
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Tenant onde a ação ocorreu
  @Column({ nullable: true })
  tenantId: string;

  // Usuário que executou a ação
  @Column({ nullable: true })
  userId: string;

  // Nome/email do usuário para exibição
  @Column({ nullable: true })
  userEmail: string;

  // Método HTTP: POST, PATCH, DELETE
  @Column({ length: 10 })
  method: string;

  // Rota acessada ex: /students, /finance/invoices/:id
  @Column({ length: 255 })
  route: string;

  // Ação resumida ex: CREATE_STUDENT, UPDATE_INVOICE
  @Column({ length: 100, nullable: true })
  action: string;

  // Status HTTP da resposta
  @Column({ nullable: true })
  statusCode: number;

  // Payload da requisição em JSON (sem dados sensíveis)
  @Column({ type: 'text', nullable: true })
  payload: string;

  // Mensagem de erro se houver
  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  // IP do cliente
  @Column({ length: 50, nullable: true })
  ipAddress: string;

  // Tempo de execução em ms
  @Column({ nullable: true })
  duration: number;

  @CreateDateColumn()
  createdAt: Date;
}
