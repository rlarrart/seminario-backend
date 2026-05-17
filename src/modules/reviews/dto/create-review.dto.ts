import { IsUUID, IsInt, Min, Max, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateReviewDto {
  @IsUUID('4', { message: 'El ID de la oportunidad debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID de la oportunidad es obligatorio' })
  opportunityId!: string;

  @IsInt({ message: 'La calificación debe ser un número entero' })
  @Min(1, { message: 'La calificación mínima es 1 estrella' })
  @Max(5, { message: 'La calificación máxima es 5 estrellas' })
  rating!: number;

  @IsString({ message: 'El comentario debe ser una cadena de texto' })
  @IsOptional()
  comment?: string;
}
