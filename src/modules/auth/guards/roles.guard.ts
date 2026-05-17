import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtenemos los roles configurados en el endpoint (pueden estar en el controlador o en el método)
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si el endpoint no requiere roles específicos, se permite el acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Verificamos si el usuario está autenticado y si su rol está entre los requeridos
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('No tienes permisos suficientes para acceder a este recurso');
    }

    return true;
  }
}
