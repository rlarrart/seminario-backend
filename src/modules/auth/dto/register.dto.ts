import { IsString, IsEmail, MinLength, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name!: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;

  @IsEnum(UserRole, { message: 'El rol debe ser buyer o supplier' })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  role!: UserRole;

  @IsString({ message: 'El nombre de la tienda debe ser una cadena de texto' })
  @IsOptional()
  storeName?: string;

  @IsString({ message: 'El nombre de la empresa debe ser una cadena de texto' })
  @IsOptional()
  companyName?: string;
}
