import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Adhesion, AdhesionStatus, CancellationReason } from './entities/adhesion.entity';
import { Opportunity, OpportunityStatus } from '../opportunities/entities/opportunity.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { CreateAdhesionDto } from './dto/create-adhesion.dto';

@Injectable()
export class AdhesionsService {
  private readonly logger = new Logger(AdhesionsService.name);

  constructor(
    @InjectRepository(Adhesion)
    private readonly adhesionRepository: Repository<Adhesion>,

    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,

    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  // Crear una nueva adhesión (Comprar/Unirse a oportunidad)
  async create(createAdhesionDto: CreateAdhesionDto, userId: string, userName: string): Promise<any> {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id: createAdhesionDto.opportunityId },
      relations: ['supplier'],
    });

    if (!opportunity) {
      throw new NotFoundException('Oportunidad de compra no encontrada');
    }

    if (opportunity.status !== OpportunityStatus.OPEN) {
      throw new BadRequestException('La oportunidad de compra ya no está abierta para nuevas adhesiones');
    }

    if (new Date(opportunity.expiresAt).getTime() <= Date.now()) {
      throw new BadRequestException('La oportunidad de compra ha expirado');
    }

    // Calculamos el monto total a pagar
    const totalAmount = Number(opportunity.wholesalePrice) * createAdhesionDto.quantity;

    // SIMULACIÓN DE PROCESO DE PAGO
    this.logger.log(
      `[PAGO SIMULADO] Verificando pago de $${totalAmount} con método: "${createAdhesionDto.paymentMethod}" para el usuario: "${userName}"`,
    );

    // Creamos la adhesión en estado pendiente
    const adhesion = this.adhesionRepository.create({
      userId,
      opportunityId: opportunity.id,
      quantity: createAdhesionDto.quantity,
      totalAmount,
      status: AdhesionStatus.PENDING,
    });

    // Validamos si el usuario ya tenía adhesiones activas previas a esta misma oportunidad
    const existingActiveAdhesions = await this.adhesionRepository.find({
      where: { userId, opportunityId: opportunity.id, status: AdhesionStatus.PENDING },
    });

    // Actualizamos las métricas de la oportunidad
    opportunity.committedUnits = Number(opportunity.committedUnits) + createAdhesionDto.quantity;
    
    // Si es el primer aporte del minorista, sumamos un miembro activo
    if (existingActiveAdhesions.length === 0) {
      opportunity.activeMembers = Number(opportunity.activeMembers) + 1;
    }

    // Guardamos la adhesión primero
    const savedAdhesion = await this.adhesionRepository.save(adhesion);

    // Verificamos si con esta adhesión se alcanza el mínimo de unidades requerido
    if (opportunity.committedUnits >= opportunity.minimumUnits) {
      this.logger.log(`¡Meta alcanzada para la oportunidad "${opportunity.title}"! Confirmando grupo.`);
      
      // Confirmamos la oportunidad
      opportunity.status = OpportunityStatus.CONFIRMED;

      // Obtenemos todas las adhesiones pendientes de la oportunidad y las confirmamos
      const pendingAdhesions = await this.adhesionRepository.find({
        where: { opportunityId: opportunity.id, status: AdhesionStatus.PENDING },
      });

      for (const pending of pendingAdhesions) {
        pending.status = AdhesionStatus.CONFIRMED;
        await this.adhesionRepository.save(pending);

        // Notificamos a cada minorista adherido
        await this.notificationRepository.save(
          this.notificationRepository.create({
            userId: pending.userId,
            type: 'opportunity_confirmed',
            title: '¡Compra confirmada!',
            message: `¡Buenas noticias! La compra grupal de "${opportunity.title}" se ha confirmado exitosamente al alcanzar el mínimo de unidades.`,
            metadata: { opportunityId: opportunity.id, adhesionId: pending.id },
          }),
        );
      }

      // Notificamos al proveedor creador
      await this.notificationRepository.save(
        this.notificationRepository.create({
          userId: opportunity.supplierId,
          type: 'opportunity_confirmed',
          title: '¡Oportunidad exitosa!',
          message: `La oportunidad "${opportunity.title}" que publicaste ha alcanzado la meta de unidades y ahora está confirmada para la venta.`,
          metadata: { opportunityId: opportunity.id },
        }),
      );
    } else {
      // Notificamos al proveedor del nuevo minorista adherido
      await this.notificationRepository.save(
        this.notificationRepository.create({
          userId: opportunity.supplierId,
          type: 'new_adhesion',
          title: 'Nueva adhesión recibida',
          message: `Un minorista se ha unido a tu publicación "${opportunity.title}" con ${createAdhesionDto.quantity} unidades.`,
          metadata: { opportunityId: opportunity.id, quantity: createAdhesionDto.quantity },
        }),
      );
    }

    // Guardamos la oportunidad actualizada
    await this.opportunityRepository.save(opportunity);

    return {
      adhesion: savedAdhesion,
      opportunity,
    };
  }

  // Obtener mis adhesiones actuales
  async findMyAdhesions(userId: string): Promise<any[]> {
    const adhesions = await this.adhesionRepository.find({
      where: { userId },
      relations: ['opportunity', 'opportunity.supplier'],
      order: { createdAt: 'DESC' },
    });

    // Mapeamos para incluir los campos virtuales calculados de la oportunidad
    return adhesions.map((adhesion) => ({
      id: adhesion.id,
      userId: adhesion.userId,
      opportunityId: adhesion.opportunityId,
      quantity: adhesion.quantity,
      totalAmount: Number(adhesion.totalAmount),
      status: adhesion.status,
      cancellationReason: adhesion.cancellationReason,
      createdAt: adhesion.createdAt,
      updatedAt: adhesion.updatedAt,
      opportunity: adhesion.opportunity ? this.mapOpportunityForAdhesion(adhesion.opportunity) : undefined,
    }));
  }

  // Versión simplificada del mapeo de oportunidad para incluir en adhesiones
  private mapOpportunityForAdhesion(opp: Opportunity) {
    const { passwordHash: _, resetToken: __, resetTokenExpiresAt: ___, ...supplierData } = (opp as any).supplier || {};
    return {
      id: opp.id,
      title: opp.title,
      description: opp.description,
      imageUrl: opp.imageUrl,
      category: opp.category,
      unitPrice: Number(opp.unitPrice),
      wholesalePrice: Number(opp.wholesalePrice),
      discountPercentage: opp.discountPercentage,
      minimumUnits: opp.minimumUnits,
      committedUnits: opp.committedUnits,
      activeMembers: opp.activeMembers,
      status: opp.status,
      expiresAt: opp.expiresAt,
      tags: opp.tags,
      supplierId: opp.supplierId,
      supplierOrigin: opp.supplierOrigin,
      supplierCatalogUrl: opp.supplierCatalogUrl,
      supplier: (opp as any).supplier ? supplierData : undefined,
      progressPercent: opp.progressPercent,
      remainingUnits: opp.remainingUnits,
    };
  }

  // Cancelar una adhesión propia
  async cancel(adhesionId: string, userId: string, userName: string): Promise<{ message: string }> {
    const adhesion = await this.adhesionRepository.findOne({
      where: { id: adhesionId },
      relations: ['opportunity'],
    });

    if (!adhesion) {
      throw new NotFoundException('Adhesión no encontrada');
    }

    if (adhesion.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para cancelar esta adhesión');
    }

    if (adhesion.status !== AdhesionStatus.PENDING) {
      throw new BadRequestException('Solo se pueden cancelar adhesiones que estén pendientes de confirmación');
    }

    // Cancelamos la adhesión
    adhesion.status = AdhesionStatus.CANCELLED;
    adhesion.cancellationReason = CancellationReason.USER;
    await this.adhesionRepository.save(adhesion);

    // Actualizamos la oportunidad
    const opportunity = adhesion.opportunity;
    opportunity.committedUnits = Math.max(0, Number(opportunity.committedUnits) - adhesion.quantity);

    // Verificamos si al minorista le queda alguna otra adhesión activa pendiente a esta misma oportunidad
    const otherActiveAdhesions = await this.adhesionRepository.find({
      where: { userId, opportunityId: opportunity.id, status: AdhesionStatus.PENDING },
    });

    // Si no le quedan más adhesiones pendientes, restamos 1 a los miembros activos
    if (otherActiveAdhesions.length === 0) {
      opportunity.activeMembers = Math.max(0, Number(opportunity.activeMembers) - 1);
    }

    await this.opportunityRepository.save(opportunity);

    // Notificamos al proveedor sobre la cancelación del minorista
    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: opportunity.supplierId,
        type: 'adhesion_cancelled',
        title: 'Adhesión cancelada',
        message: `El minorista "${userName}" ha cancelado su adhesión de ${adhesion.quantity} unidades en "${opportunity.title}".`,
        metadata: { opportunityId: opportunity.id, quantity: adhesion.quantity },
      }),
    );

    return { message: 'Tu participación ha sido cancelada y el reembolso virtual procesado exitosamente' };
  }
}
