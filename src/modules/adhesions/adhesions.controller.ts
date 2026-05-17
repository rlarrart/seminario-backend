import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AdhesionsService } from './adhesions.service';
import { CreateAdhesionDto } from './dto/create-adhesion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@Controller('adhesions')
@UseGuards(JwtAuthGuard)
export class AdhesionsController {
  constructor(private readonly adhesionsService: AdhesionsService) {}

  // Adherirse/comprar a una oportunidad (solo minoristas/buyers)
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.BUYER)
  async create(
    @Body() createAdhesionDto: CreateAdhesionDto,
    @CurrentUser() user: User,
  ) {
    return this.adhesionsService.create(createAdhesionDto, user.id, user.name);
  }

  // Obtener mis adhesiones actuales (cualquier usuario autenticado)
  @Get('my')
  async findMyAdhesions(@CurrentUser() user: User) {
    return this.adhesionsService.findMyAdhesions(user.id);
  }

  // Cancelar una adhesión propia
  @Patch(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.adhesionsService.cancel(id, user.id, user.name);
  }
}
