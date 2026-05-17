import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { OpportunityQueryDto } from './dto/opportunity-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  // Crear oportunidad (solo proveedores)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPPLIER)
  async create(
    @Body() createOpportunityDto: CreateOpportunityDto,
    @CurrentUser() user: User,
  ) {
    return this.opportunitiesService.create(createOpportunityDto, user.id);
  }

  // Obtener lista filtrada (público)
  @Get()
  async findAll(@Query() query: OpportunityQueryDto) {
    return this.opportunitiesService.findAll(query);
  }

  // Obtener una en particular con todo el detalle (público)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.opportunitiesService.findOne(id);
  }

  // Modificar oportunidad (solo proveedores creadores)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPPLIER)
  async update(
    @Param('id') id: string,
    @Body() updateOpportunityDto: UpdateOpportunityDto,
    @CurrentUser() user: User,
  ) {
    return this.opportunitiesService.update(id, updateOpportunityDto, user.id);
  }

  // Eliminar oportunidad (solo proveedores creadores)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPPLIER)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.opportunitiesService.remove(id, user.id);
  }
}
