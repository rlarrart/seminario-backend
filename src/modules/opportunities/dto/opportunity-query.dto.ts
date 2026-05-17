import { IsString, IsOptional } from 'class-validator';

export class OpportunityQueryDto {
  @IsString({ message: 'La categoría debe ser una cadena de texto' })
  @IsOptional()
  category?: string;

  @IsString({ message: 'El estado debe ser una cadena de texto' })
  @IsOptional()
  status?: string;

  @IsString({ message: 'El ID de proveedor debe ser una cadena de texto' })
  @IsOptional()
  supplierId?: string;

  @IsString({ message: 'El término de búsqueda debe ser una cadena de texto' })
  @IsOptional()
  search?: string;
}
