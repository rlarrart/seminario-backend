import { IsString, IsNotEmpty, IsNumber, IsPositive, IsInt, Min, Max, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateOpportunityDto {
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  title!: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description!: string;

  @IsString({ message: 'La URL de la imagen debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La URL de la imagen es obligatoria' })
  imageUrl!: string;

  @IsString({ message: 'La categoría debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  category!: string;

  @IsNumber({}, { message: 'El precio unitario debe ser un número' })
  @IsPositive({ message: 'El precio unitario debe ser positivo' })
  unitPrice!: number;

  @IsNumber({}, { message: 'El precio mayorista debe ser un número' })
  @IsPositive({ message: 'El precio mayorista debe ser positivo' })
  wholesalePrice!: number;

  @IsInt({ message: 'El porcentaje de descuento debe ser un número entero' })
  @Min(0, { message: 'El descuento no puede ser menor a 0' })
  @Max(100, { message: 'El descuento no puede ser mayor a 100' })
  discountPercentage!: number;

  @IsInt({ message: 'Las unidades mínimas deben ser un número entero' })
  @Min(1, { message: 'El mínimo de unidades debe ser al menos 1' })
  minimumUnits!: number;

  @IsDateString({}, { message: 'La fecha de expiración debe ser una fecha válida en formato ISO' })
  expiresAt!: string;

  @IsArray({ message: 'Las etiquetas deben ser una lista' })
  @IsString({ each: true, message: 'Cada etiqueta debe ser una cadena de texto' })
  @IsOptional()
  tags?: string[];

  @IsString({ message: 'El origen del proveedor debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El origen del proveedor es obligatorio' })
  supplierOrigin!: string;

  @IsString({ message: 'La URL del catálogo debe ser una cadena de texto' })
  @IsOptional()
  supplierCatalogUrl?: string;
}
