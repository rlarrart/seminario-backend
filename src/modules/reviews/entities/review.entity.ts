import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Unique, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Opportunity } from '../../opportunities/entities/opportunity.entity';

@Entity('reviews')
@Unique(['authorId', 'opportunityId']) // Un usuario solo califica una oportunidad una vez
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'author_id' })
  authorId!: string;

  @Column({ type: 'uuid', name: 'opportunity_id' })
  opportunityId!: string;

  @Column({ type: 'int' })
  rating!: number; // Calificación de 1 a 5 estrellas

  @Column({ type: 'text', nullable: true })
  comment?: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @ManyToOne(() => User, (u) => u.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @ManyToOne(() => Opportunity, (o) => o.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'opportunity_id' })
  opportunity!: Opportunity;
}
