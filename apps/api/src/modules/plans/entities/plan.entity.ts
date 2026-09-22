import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum PlanDuration {
  MONTHLY = 'monthly', // mensal
  QUARTERLY = 'quarterly', // trimestral
  SEMIANNUAL = 'semiannual', // semestral
  ANNUAL = 'annual', // anual
  CUSTOM = 'custom', // personalizado
}

/*
 * Plan Entity
 * Representa um plano disponível na academia.
 * Cada plano pertence a um tenant (academia).
 */
@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Vínculo com a academia (multi-tenant)
  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // Nome do plano ex: "Plano Mensal", "Plano Anual VIP"
  @Column({ length: 100 })
  name: string;

  // Descrição opcional do plano
  @Column({ type: 'text', nullable: true })
  description: string;

  // Preço do plano em decimal (ex: 99.90)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  // Duração do plano (mensal, trimestral, etc.)
  @Column({ type: 'enum', enum: PlanDuration, default: PlanDuration.MONTHLY })
  duration: PlanDuration;

  // Número de dias do plano (útil para planos customizados)
  @Column({ default: 30 })
  durationDays: number;

  // Taxa de matrícula cobrada ao iniciar o plano
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  enrollmentFee: number;

  // Limite de acessos por mês (0 = ilimitado)
  @Column({ default: 0 })
  accessLimit: number;

  // Se o plano está ativo e disponível para venda
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
