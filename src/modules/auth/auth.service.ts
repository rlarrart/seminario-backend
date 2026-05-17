import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

// Constantes para evitar hardcodeo
const BCRYPT_SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRATION_MS = 60 * 60 * 1000; // 1 hora en milisegundos

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Registrar un nuevo usuario
  async register(registerDto: RegisterDto) {
    const passwordHash = await bcrypt.hash(registerDto.password, BCRYPT_SALT_ROUNDS);
    
    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      passwordHash,
      role: registerDto.role,
      storeName: registerDto.role === UserRole.BUYER ? registerDto.storeName : null,
      companyName: registerDto.role === UserRole.SUPPLIER ? registerDto.companyName : null,
    });

    const token = this.generateToken(user);
    
    // Retornamos el usuario sin el password_hash por seguridad
    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }

  // Iniciar sesión
  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const token = this.generateToken(user);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }

  // Solicitar recuperación de contraseña (envía un token ficticio)
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    
    // Por razones de seguridad (evitar la enumeración de emails), si no existe
    // respondemos con éxito igualmente, pero no hacemos nada internamente.
    if (user) {
      // Generamos un token aleatorio seguro de 32 bytes en formato hex
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRATION_MS);

      user.resetToken = resetToken;
      user.resetTokenExpiresAt = resetTokenExpiresAt;
      await this.usersService.save(user);

      // Simulamos el envío de email mostrando el enlace por consola
      const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
      this.logger.log(`[SIMULACIÓN EMAIL] Enlace de reestablecimiento para ${user.email}: ${resetLink}`);
    }

    return {
      message: 'Si el correo electrónico existe en nuestro sistema, se ha enviado un enlace para restablecer la contraseña.',
    };
  }

  // Restablecer contraseña con el token provisto
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(resetPasswordDto.token);
    
    if (!user) {
      throw new BadRequestException('El token de restablecimiento es inválido o no existe.');
    }

    if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('El token de restablecimiento ha expirado.');
    }

    // Hasheamos la nueva contraseña
    const passwordHash = await bcrypt.hash(resetPasswordDto.newPassword, BCRYPT_SALT_ROUNDS);
    
    user.passwordHash = passwordHash;
    user.resetToken = null;
    user.resetTokenExpiresAt = null;
    await this.usersService.save(user);

    return {
      message: 'Tu contraseña ha sido restablecida exitosamente.',
    };
  }

  // Generar token JWT para el usuario
  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}
