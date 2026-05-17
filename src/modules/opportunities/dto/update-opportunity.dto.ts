import { IsString, IsNumber, IsPositive, IsInt, Min, Max, IsOptional, IsArray, IsDateString, IsEnum } from 'class-validator';
import { OpportunityStatus } from '../entities/opportunity.entity';

export class UpdateOpportunityDto {
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'La URL de la imagen debe ser una cadena de texto' })
  @IsOptional()
  imageUrl?: string;

  @IsString({ message: 'La categoría debe ser una cadena de texto' })
  @IsOptional()
  category?: string;

  @IsNumber({}, { message: 'El precio unitario debe ser un número' })
  @IsPositive({ message: 'El precio unitario debe ser positivo' })
  @IsOptional()
  unitPrice?: number;

  @IsNumber({}, { message: 'El precio mayorista debe ser un número' })
  @IsPositive({ message: 'El precio mayorista debe ser positivo' })
  @IsOptional()
  wholesalePrice?: number;

  @IsInt({ message: 'El porcentaje de descuento debe ser un número entero' })
  @Min(0, { message: 'El descuento no puede ser menor a 0' })
  @Max(100, { message: 'El descuento no puede ser mayor a 100' })
  @IsOptional()
  discountPercentage?: number;

  @IsInt({ message: 'Las unidades mínimas deben ser un número entero' })
  @Min(1, { message: 'El mínimo de unidades debe ser al menos 1' })
  @IsOptional()
  minimumUnits?: number;

  @IsEnum(OpportunityStatus, { message: 'El estado debe ser open, confirmed o cancelled' })
  @IsOptional()
  status?: OpportunityStatus;

  @IsDateString({}, { message: 'La fecha de expiración debe ser una fecha válida en formato ISO' })
  @IsOptional()
  expiresAt?: string;

  @IsArray({ message: 'Las etiquetas deben ser una lista' })
  @IsString({ each: true, message: 'Cada etiqueta debe ser una cadena de texto' })
  @IsOptional()
  tags?: string[];

  @IsString({ message: 'El origen del proveedor debe ser una cadena de texto' })
  @IsOptional()
  supplierOrigin?: string;

  @IsString({ message: 'La URL del catálogo debe ser una cadena de texto' })
  @IsOptional()
  supplierCatalogUrl?: string;
}
