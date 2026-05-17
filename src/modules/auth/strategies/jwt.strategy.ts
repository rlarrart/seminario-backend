import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      // Extraemos el token del encabezado Authorization como Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Obtenemos el secreto desde las variables de entorno
      secretOrKey: configService.get<string>('JWT_SECRET', 'super_secret_key_change_me_in_production_12345'),
    });
  }

  // Método que se ejecuta al validar el token de forma automática
  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Token no válido o usuario inexistente');
    }
    
    // Lo que retorne aquí se inyectará en request.user
    return user;
  }
}
