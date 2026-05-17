import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Obtener la lista de notificaciones del usuario actual
  @Get()
  async findAll(@CurrentUser() user: User) {
    return this.notificationsService.findAll(user.id);
  }

  // Marcar todas las notificaciones como leídas
  @Patch('read-all')
  async readAll(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  // Marcar una notificación específica como leída
  @Patch(':id/read')
  async readOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationsService.markAsRead(id, user.id);
  }
}
