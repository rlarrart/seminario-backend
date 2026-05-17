import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Adhesion } from '../../adhesions/entities/adhesion.entity';
import { Review } from '../../reviews/entities/review.entity';

// Enum de estados de oportunidad
export enum OpportunityStatus {
  OPEN = 'open',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Entity('opportunities')
export class Opportunity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 500, name: 'image_url' })
  imageUrl!: string;

  @Column({ type: 'varchar', length: 100 })
  category!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'unit_price' })
  unitPrice!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'wholesale_price' })
  wholesalePrice!: number;

  @Column({ type: 'int', name: 'discount_percentage' })
  discountPercentage!: number;

  @Column({ type: 'int', name: 'minimum_units' })
  minimumUnits!: number;

  @Column({ type: 'int', default: 0, name: 'committed_units' })
  committedUnits!: number;

  @Column({ type: 'int', default: 0, name: 'active_members' })
  activeMembers!: number;

  @Column({
    type: 'enum',
    enum: OpportunityStatus,
    default: OpportunityStatus.OPEN,
  })
  status!: OpportunityStatus;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt!: Date;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[] | null;

  @Column({ type: 'uuid', name: 'supplier_id' })
  supplierId!: string;

  @Column({ type: 'varchar', length: 255, name: 'supplier_origin' })
  supplierOrigin!: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'supplier_catalog_url' })
  supplierCatalogUrl?: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @ManyToOne(() => User, (u) => u.opportunities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplier_id' })
  supplier!: User;

  @OneToMany(() => Adhesion, (a) => a.opportunity)
  adhesions!: Adhesion[];

  @OneToMany(() => Review, (r) => r.opportunity)
  reviews!: Review[];

  // Getters virtuales (se calculan en base a propiedades existentes)
  get progressPercent(): number {
    if (this.minimumUnits <= 0) return 0;
    return Math.min(100, Math.round((this.committedUnits / this.minimumUnits) * 100));
  }

  get remainingUnits(): number {
    return Math.max(0, this.minimumUnits - this.committedUnits);
  }
}
