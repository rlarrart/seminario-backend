import { IsEnum } from 'class-validator';
import { AdhesionStatus } from '../entities/adhesion.entity';

export class UpdateAdhesionStatusDto {
  @IsEnum(AdhesionStatus, {
    message: 'El estado debe ser uno de: confirmed, preparing, shipped, delivered',
  })
  status!: AdhesionStatus;
}
