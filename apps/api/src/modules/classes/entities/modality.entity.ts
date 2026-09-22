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

/**
 * Modality Entity
 * Representa uma modalidade de atividade física oferecida pela academia.
 * Exemplos: Musculação, Funcional, Spinning, Pilates, Dança, Yoga.
 *
 * Cada modalidade pertence a um tenant e pode ter múltiplas turmas vinculadas.
 * É o primeiro nível da hierarquia: Modalidade → Turma → Agenda → Alunos.
 */
@Entity('modalities')
export class Modality {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Vínculo com a academia (multi-tenant)
  @Column({ nullable: false })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // Nome da modalidade ex: "Musculação", "Funcional", "Spinning"
  @Column({ length: 100 })
  name: string;

  // Descrição opcional da modalidade
  @Column({ type: 'text', nullable: true })
  description: string;

  // Se a modalidade está ativa e disponível para criação de turmas
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
