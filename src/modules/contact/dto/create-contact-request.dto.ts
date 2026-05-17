import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateContactRequestDto {
  @IsString({ message: 'El nombre de la empresa debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio' })
  company!: string;

  @IsString({ message: 'La categoría de productos debe ser una cadena de texto' })
  @IsOptional()
  category?: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email!: string;

  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsOptional()
  phone?: string;

  @IsString({ message: 'El volumen de venta estimado debe ser una cadena de texto' })
  @IsOptional()
  volume?: string;

  @IsString({ message: 'El mensaje debe ser una cadena de texto' })
  @IsOptional()
  message?: string;
}
