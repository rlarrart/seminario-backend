import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, LessThanOrEqual } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Opportunity, OpportunityStatus } from './entities/opportunity.entity';
import { Adhesion, AdhesionStatus, CancellationReason } from '../adhesions/entities/adhesion.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { OpportunityQueryDto } from './dto/opportunity-query.dto';

@Injectable()
export class OpportunitiesService {
  private readonly logger = new Logger(OpportunitiesService.name);

  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,

    @InjectRepository(Adhesion)
    private readonly adhesionRepository: Repository<Adhesion>,

    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  // Crear una oportunidad (solo proveedores)
  async create(createOpportunityDto: CreateOpportunityDto, supplierId: string): Promise<any> {
    const opportunity = this.opportunityRepository.create({
      ...createOpportunityDto,
      supplierId,
      expiresAt: new Date(createOpportunityDto.expiresAt),
      committedUnits: 0,
      activeMembers: 0,
      status: OpportunityStatus.OPEN,
    });

    const saved = await this.opportunityRepository.save(opportunity);
    return this.mapOpportunity(saved);
  }

  // Obtener oportunidades con filtros y búsqueda
  async findAll(query: OpportunityQueryDto): Promise<any[]> {
    const { category, status, supplierId, search } = query;
    const qb = this.opportunityRepository.createQueryBuilder('opp');
    
    qb.leftJoinAndSelect('opp.supplier', 'supplier');

    // Si se filtra por proveedor, mostramos todas sus oportunidades sin filtro de estado por defecto.
    // Si no, aplicamos el filtro de estado (por defecto 'open' para el marketplace público).
    if (status && status !== 'all') {
      qb.where('opp.status = :status', { status });
    } else if (!supplierId) {
      // Sin supplierId, por defecto mostramos solo oportunidades abiertas en el marketplace
      qb.where('opp.status = :status', { status: OpportunityStatus.OPEN });
    }

    if (category) {
      qb.andWhere('opp.category = :category', { category });
    }

    if (supplierId) {
      qb.andWhere('opp.supplierId = :supplierId', { supplierId });
    }

    if (search) {
      qb.andWhere(
        '(opp.title ILIKE :search OR opp.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Ordenamos por fecha de creación descendente
    qb.orderBy('opp.createdAt', 'DESC');

    const opportunities = await qb.getMany();
    return opportunities.map((opp) => this.mapOpportunity(opp));
  }

  // Obtener una oportunidad en detalle por ID
  async findOne(id: string): Promise<any> {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id },
      relations: ['supplier', 'adhesions', 'adhesions.user'],
    });

    if (!opportunity) {
      throw new NotFoundException('Oportunidad de compra no encontrada');
    }

    return this.mapOpportunity(opportunity);
  }

  // Actualizar una oportunidad (solo creador/proveedor)
  async update(id: string, updateOpportunityDto: UpdateOpportunityDto, supplierId: string): Promise<any> {
    const opportunity = await this.opportunityRepository.findOne({ where: { id } });
    if (!opportunity) {
      throw new NotFoundException('Oportunidad de compra no encontrada');
    }

    // Validamos que el proveedor sea el propietario
    if (opportunity.supplierId !== supplierId) {
      throw new ForbiddenException('No tienes permisos para modificar esta oportunidad');
    }

    Object.assign(opportunity, {
      ...updateOpportunityDto,
      expiresAt: updateOpportunityDto.expiresAt ? new Date(updateOpportunityDto.expiresAt) : opportunity.expiresAt,
    });

    const updated = await this.opportunityRepository.save(opportunity);
    return this.mapOpportunity(updated);
  }

  // Eliminar una oportunidad (solo creador/proveedor)
  async remove(id: string, supplierId: string): Promise<{ message: string }> {
    const opportunity = await this.opportunityRepository.findOne({ where: { id } });
    if (!opportunity) {
      throw new NotFoundException('Oportunidad de compra no encontrada');
    }

    if (opportunity.supplierId !== supplierId) {
      throw new ForbiddenException('No tienes permisos para eliminar esta oportunidad');
    }

    await this.opportunityRepository.remove(opportunity);
    return { message: 'Oportunidad eliminada exitosamente' };
  }

  // Tarea programada (Cron Job) que se ejecuta cada hora para cancelar oportunidades expiradas
  @Cron('0 * * * *')
  async handleExpiredOpportunities() {
    this.logger.log('Iniciando verificación de oportunidades expiradas...');
    const now = new Date();

    // Buscamos oportunidades abiertas cuya fecha de expiración sea menor o igual a la actual
    const expiredOpportunities = await this.opportunityRepository.find({
      where: {
        status: OpportunityStatus.OPEN,
        expiresAt: LessThanOrEqual(now),
      },
      relations: ['adhesions', 'adhesions.user'],
    });

    if (expiredOpportunities.length === 0) {
      this.logger.log('No se encontraron oportunidades expiradas.');
      return;
    }

    for (const opp of expiredOpportunities) {
      this.logger.log(`Cancelando oportunidad expirada ID: ${opp.id} - "${opp.title}"`);
      
      // 1. Cambiamos el estado de la oportunidad a CANCELLED
      opp.status = OpportunityStatus.CANCELLED;
      await this.opportunityRepository.save(opp);

      // 2. Cancelamos todas sus adhesiones activas
      if (opp.adhesions && opp.adhesions.length > 0) {
        for (const adhesion of opp.adhesions) {
          if (adhesion.status === AdhesionStatus.PENDING) {
            adhesion.status = AdhesionStatus.CANCELLED;
            adhesion.cancellationReason = CancellationReason.OPPORTUNITY_EXPIRED;
            await this.adhesionRepository.save(adhesion);

            // 3. Notificamos al comprador
            await this.notificationRepository.save(
              this.notificationRepository.create({
                userId: adhesion.userId,
                type: 'opportunity_expired',
                title: 'Compra grupal expirada',
                message: `La oportunidad "${opp.title}" expiró sin alcanzar el mínimo de unidades. Tu participación ha sido cancelada.`,
                metadata: { opportunityId: opp.id, adhesionId: adhesion.id },
              }),
            );
          }
        }
      }

      // 4. Notificamos al proveedor creador
      await this.notificationRepository.save(
        this.notificationRepository.create({
          userId: opp.supplierId,
          type: 'opportunity_expired',
          title: 'Tu publicación ha expirado',
          message: `La oportunidad "${opp.title}" que publicaste ha expirado sin alcanzar el mínimo de unidades.`,
          metadata: { opportunityId: opp.id },
        }),
      );
    }

    this.logger.log(`Proceso finalizado. Se procesaron ${expiredOpportunities.length} oportunidades.`);
  }

  // Mapear campos virtuales calculados dinámicamente para el JSON
  private mapOpportunity(opp: Opportunity) {
    // Para evitar que falle si progressPercent/remainingUnits no existen por sincronización
    const { passwordHash: _, resetToken: __, resetTokenExpiresAt: ___, ...supplierData } = opp.supplier || {};
    
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
      createdAt: opp.createdAt,
      updatedAt: opp.updatedAt,
      supplier: opp.supplier ? supplierData : undefined,
      adhesions: opp.adhesions,
      progressPercent: opp.progressPercent,
      remainingUnits: opp.remainingUnits,
    };
  }
}
