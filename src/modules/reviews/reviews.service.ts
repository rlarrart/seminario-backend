import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Opportunity, OpportunityStatus } from '../opportunities/entities/opportunity.entity';
import { Adhesion, AdhesionStatus } from '../adhesions/entities/adhesion.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,

    @InjectRepository(Adhesion)
    private readonly adhesionRepository: Repository<Adhesion>,
  ) {}

  // Crear una nueva reseña
  async create(createReviewDto: CreateReviewDto, userId: string): Promise<Review> {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id: createReviewDto.opportunityId },
    });

    if (!opportunity) {
      throw new NotFoundException('Oportunidad de compra no encontrada');
    }

    // 1. Validar que la oportunidad esté consolidada/confirmada
    if (opportunity.status !== OpportunityStatus.CONFIRMED) {
      throw new BadRequestException('Solo se pueden calificar oportunidades que hayan sido confirmadas y finalizadas con éxito');
    }

    // 2. Validar que el usuario haya recibido el producto (adhesión entregada)
    const activeAdhesion = await this.adhesionRepository.findOne({
      where: {
        userId,
        opportunityId: opportunity.id,
        status: AdhesionStatus.DELIVERED,
      },
    });

    if (!activeAdhesion) {
      throw new BadRequestException('Debes haber recibido el producto (estado entregado) en esta compra grupal para poder dejar una valoración');
    }

    // 3. Validar que no haya calificado la misma oportunidad previamente (Unique authorId + opportunityId)
    const existingReview = await this.reviewRepository.findOne({
      where: {
        authorId: userId,
        opportunityId: opportunity.id,
      },
    });

    if (existingReview) {
      throw new BadRequestException('Ya has calificado esta oportunidad de compra anteriormente');
    }

    // Guardar la reseña
    const review = this.reviewRepository.create({
      authorId: userId,
      opportunityId: opportunity.id,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
    });

    return this.reviewRepository.save(review);
  }

  // Obtener todas las reseñas escritas por un usuario en particular
  async findByUser(userId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { authorId: userId },
      relations: ['opportunity', 'author'],
      order: { createdAt: 'DESC' },
    });
  }

  // Obtener todas las reseñas de una oportunidad en particular
  async findByOpportunity(opportunityId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { opportunityId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  // Obtener todas las reseñas recibidas por un proveedor
  async findBySupplier(supplierId: string): Promise<Review[]> {
    return this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.author', 'author')
      .leftJoinAndSelect('review.opportunity', 'opportunity')
      .where('opportunity.supplierId = :supplierId', { supplierId })
      .orderBy('review.createdAt', 'DESC')
      .getMany();
  }
}
