import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'El token de reestablecimiento debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El token es obligatorio' })
  token!: string;

  @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  newPassword!: string;
}
