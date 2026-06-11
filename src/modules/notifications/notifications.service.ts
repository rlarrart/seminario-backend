import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  // Obtener todas las notificaciones de un usuario en orden descendente
  async findAll(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Marcar una notificación específica como leída
  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para modificar esta notificación');
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  // Marcar todas las notificaciones del usuario como leídas
  async markAllAsRead(userId: string): Promise<{ message: string }> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { message: 'Todas las notificaciones han sido marcadas como leídas' };
  }

  // Eliminar todas las notificaciones de un usuario
  async clearAll(userId: string): Promise<{ message: string }> {
    await this.notificationRepository.delete({ userId });
    return { message: 'Todas las notificaciones han sido eliminadas' };
  }

  // Eliminar una notificación específica
  async deleteOne(id: string, userId: string): Promise<{ message: string }> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar esta notificación');
    }

    await this.notificationRepository.remove(notification);
    return { message: 'Notificación eliminada' };
  }
}
