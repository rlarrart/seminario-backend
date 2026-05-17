import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

// Clave usada para guardar la metadata de los roles en el contexto de la petición
export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
