import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, UseInterceptors, UploadedFile, Req, BadRequestException } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { OpportunityQueryDto } from './dto/opportunity-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as express from 'express';

const UPLOAD_DEST = './public/uploads';

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

  // Subir imagen para la oportunidad (solo proveedores)
  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DEST,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp)'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: express.Request) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    const host = req.get('host');
    const protocol = req.protocol;
    const imageUrl = `${protocol}://${host}/public/uploads/${file.filename}`;
    return { imageUrl };
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
