import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Invoice } from './invoice.entity';

export enum PaymentMethod {
  CASH = 'cash', // dinheiro
  CREDIT_CARD = 'credit_card', // cartão de crédito
  DEBIT_CARD = 'debit_card', // cartão de débito
  TRANSFER = 'transfer', // transferência bancária
  PIX = 'pix', // PIX
  OTHER = 'other', // outro
}

/**
 * Payment Entity
 * Representa um pagamento realizado para uma cobrança (Invoice).
 * Um invoice pode ter múltiplos payments (pagamentos parciais).
 *
 * O relacionamento com Invoice usa onDelete: RESTRICT para
 * impedir exclusão de cobranças que já possuem pagamentos.
 * Não referencia invoice.payments no ManyToOne para evitar
 * conflito de cascade que causava invoiceId sendo nullificado.
 */
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Vínculo com a academia (multi-tenant)
  @Column({ nullable: false })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // ID da cobrança vinculada — NOT NULL obrigatório
  @Column({ nullable: false })
  invoiceId: string;

  /**
   * Relacionamento com Invoice sem referência reversa
   * para evitar que o TypeORM tente nullificar invoiceId
   * ao salvar a invoice pai.
   */
  @ManyToOne(() => Invoice, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  // Valor pago neste pagamento
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  // Meio de pagamento utilizado
  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CASH })
  method: PaymentMethod;

  // Data em que o pagamento foi realizado
  @Column({ type: 'date', nullable: false })
  paymentDate: Date;

  // Observações sobre o pagamento
  @Column({ type: 'text', nullable: true })
  observations: string;

  // ID do usuário que registrou o pagamento (recepção/financeiro)
  @Column({ nullable: true })
  receivedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
