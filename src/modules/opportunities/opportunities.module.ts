import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Opportunity } from './entities/opportunity.entity';
import { Adhesion } from '../adhesions/entities/adhesion.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitiesController } from './opportunities.controller';

@Module({
  imports: [
    // Registramos las entidades que usará el servicio para inyectar repositorios
    TypeOrmModule.forFeature([Opportunity, Adhesion, Notification]),
  ],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
  exports: [OpportunitiesService, TypeOrmModule],
})
export class OpportunitiesModule {}
