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

export enum StudentStatus {
  LEAD = 'lead',
  ACTIVE = 'active',
  PENDING = 'pending',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled',
}

export enum StudentGoal {
  WEIGHT_LOSS = 'weight_loss',
  HYPERTROPHY = 'hypertrophy',
  CONDITIONING = 'conditioning',
  REHABILITATION = 'rehabilitation',
  OTHER = 'other',
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 20, nullable: true })
  document: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({
    type: 'enum',
    enum: StudentStatus,
    default: StudentStatus.ACTIVE,
  })
  status: StudentStatus;

  @Column({
    type: 'enum',
    enum: StudentGoal,
    nullable: true,
  })
  goal: StudentGoal;

  @Column({ type: 'text', nullable: true })
  healthNotes: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @Column({ length: 100, nullable: true })
  emergencyContactName: string;

  @Column({ length: 20, nullable: true })
  emergencyContactPhone: string;

  @Column({ length: 200, nullable: true })
  address: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
