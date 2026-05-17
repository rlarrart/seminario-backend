import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Adhesion } from './entities/adhesion.entity';
import { Opportunity } from '../opportunities/entities/opportunity.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { AdhesionsService } from './adhesions.service';
import { AdhesionsController } from './adhesions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Adhesion, Opportunity, Notification]),
  ],
  controllers: [AdhesionsController],
  providers: [AdhesionsService],
  exports: [AdhesionsService],
})
export class AdhesionsModule {}
