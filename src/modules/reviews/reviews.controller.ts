import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller() // Dejamos vacío el prefijo del controlador para mapear rutas raíz personalizadas
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Crear una nueva valoración (solo para usuarios autenticados)
  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.create(createReviewDto, user.id);
  }

  // Obtener opiniones escritas por un usuario específico (público)
  @Get('users/:id/reviews')
  async findByUser(@Param('id') userId: string) {
    return this.reviewsService.findByUser(userId);
  }

  // Obtener opiniones dejadas para una oportunidad específica (público)
  @Get('opportunities/:id/reviews')
  async findByOpportunity(@Param('id') opportunityId: string) {
    return this.reviewsService.findByOpportunity(opportunityId);
  }

  // Obtener opiniones recibidas por un proveedor específico (público)
  @Get('suppliers/:id/reviews')
  async findBySupplier(@Param('id') supplierId: string) {
    return this.reviewsService.findBySupplier(supplierId);
  }
}
