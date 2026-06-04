import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Opportunity } from '../../opportunities/entities/opportunity.entity';

// Enum de estados de adhesión
export enum AdhesionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  PREPARING = 'preparing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
}

// Enum de razones de cancelación
export enum CancellationReason {
  USER = 'user',
  OPPORTUNITY_EXPIRED = 'opportunity_expired',
}

@Entity('adhesions')
export class Adhesion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'opportunity_id' })
  opportunityId!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_amount' })
  totalAmount!: number;

  @Column({
    type: 'enum',
    enum: AdhesionStatus,
    default: AdhesionStatus.PENDING,
  })
  status!: AdhesionStatus;

  @Column({
    type: 'enum',
    enum: CancellationReason,
    nullable: true,
    name: 'cancellation_reason',
  })
  cancellationReason?: CancellationReason | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @ManyToOne(() => User, (u) => u.adhesions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Opportunity, (o) => o.adhesions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'opportunity_id' })
  opportunity!: Opportunity;
}
