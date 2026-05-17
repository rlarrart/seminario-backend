import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Opportunity } from '../../opportunities/entities/opportunity.entity';
import { Adhesion } from '../../adhesions/entities/adhesion.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Review } from '../../reviews/entities/review.entity';

// Enum de roles de usuario
export enum UserRole {
  BUYER = 'buyer',
  SUPPLIER = 'supplier',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.BUYER,
  })
  role!: UserRole;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'store_name' })
  storeName?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'company_name' })
  companyName?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'avatar_url' })
  avatarUrl?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'reset_token' })
  resetToken?: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'reset_token_expires_at' })
  resetTokenExpiresAt?: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @OneToMany(() => Opportunity, (o) => o.supplier)
  opportunities!: Opportunity[];

  @OneToMany(() => Adhesion, (a) => a.user)
  adhesions!: Adhesion[];

  @OneToMany(() => Notification, (n) => n.user)
  notifications!: Notification[];

  @OneToMany(() => Review, (r) => r.author)
  reviews!: Review[];
}
