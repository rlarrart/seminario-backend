import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User, UserRole } from './modules/users/entities/user.entity';
import { Opportunity, OpportunityStatus } from './modules/opportunities/entities/opportunity.entity';
import { Adhesion, AdhesionStatus, CancellationReason } from './modules/adhesions/entities/adhesion.entity';
import { Notification } from './modules/notifications/entities/notification.entity';
import { Review } from './modules/reviews/entities/review.entity';
import { ContactRequest } from './modules/contact/entities/contact-request.entity';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

const BCRYPT_SALT_ROUNDS = 10;

async function runSeed() {
  const logger = new Logger('Seed');
  logger.log('Iniciando proceso de seeding...');

  // Creamos el contexto de la aplicación NestJS sin HTTP
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    // 1. Limpieza de tablas en orden por claves foráneas
    logger.log('Limpiando tablas de la base de datos...');
    await dataSource.getRepository(Review).createQueryBuilder().delete().execute();
    await dataSource.getRepository(Adhesion).createQueryBuilder().delete().execute();
    await dataSource.getRepository(Notification).createQueryBuilder().delete().execute();
    await dataSource.getRepository(Opportunity).createQueryBuilder().delete().execute();
    await dataSource.getRepository(ContactRequest).createQueryBuilder().delete().execute();
    await dataSource.getRepository(User).createQueryBuilder().delete().execute();
    logger.log('Tablas limpias exitosamente.');

    // 2. Generación del hash de contraseña para los usuarios semilla (password123)
    const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

    // 3. Creación de usuarios minoristas (buyers) y proveedores (suppliers)
    logger.log('Creando usuarios de prueba...');
    const userRepository = dataSource.getRepository(User);

    const buyer1 = userRepository.create({
      name: 'Don Pepe',
      email: 'minorista1@minimax.com',
      passwordHash,
      role: UserRole.BUYER,
      storeName: 'Tienda de Abarrotes Don Pepe',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    });

    const buyer2 = userRepository.create({
      name: 'Super Familiar',
      email: 'minorista2@minimax.com',
      passwordHash,
      role: UserRole.BUYER,
      storeName: 'Supermercado Familiar',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    });

    const supplier1 = userRepository.create({
      name: 'Alimentos del Sur',
      email: 'proveedor1@minimax.com',
      passwordHash,
      role: UserRole.SUPPLIER,
      companyName: 'Distribuidora Alimentos del Sur S.A.',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    });

    const supplier2 = userRepository.create({
      name: 'La Vaca Feliz',
      email: 'proveedor2@minimax.com',
      passwordHash,
      role: UserRole.SUPPLIER,
      companyName: 'Lácteos La Vaca Feliz',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    });

    const [uBuyer1, uBuyer2, uSupplier1, uSupplier2] = await userRepository.save([
      buyer1,
      buyer2,
      supplier1,
      supplier2,
    ]);
    logger.log('Usuarios de prueba creados exitosamente.');

    // 4. Creación de oportunidades de compra grupal
    logger.log('Creando publicaciones y oportunidades...');
    const opportunityRepository = dataSource.getRepository(Opportunity);

    const now = new Date();
    
    // Oportunidad 1: Abierta
    const opp1 = opportunityRepository.create({
      title: 'Aceite de Girasol Pureza 1.5L (Caja x 12 unidades)',
      description: 'Aceite refinado de primera calidad, ideal para venta directa o consumo en gastronomía. Descuento exclusivo reuniendo el mínimo de compra.',
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
      category: 'Alimentos',
      unitPrice: 54.00,
      wholesalePrice: 38.20,
      discountPercentage: 29,
      minimumUnits: 100,
      committedUnits: 45,
      activeMembers: 1,
      status: OpportunityStatus.OPEN,
      expiresAt: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 días en el futuro
      supplierId: uSupplier1.id,
      supplierOrigin: 'Mendoza, Argentina',
      supplierCatalogUrl: 'https://alimentosdelsur.com/catalogo.pdf',
      tags: ['Aceites', 'Almacén', 'Oferta'],
    });

    // Oportunidad 2: Abierta
    const opp2 = opportunityRepository.create({
      title: 'Queso Cremoso de Primera Calidad (Horma de 4kg apróx.)',
      description: 'Horma de queso cremoso libre de gluten (sin TACC). Increíble textura y sabor especial para pizzas y tartas.',
      imageUrl: 'https://images.unsplash.com/photo-1486887396153-fa416525c108?auto=format&fit=crop&w=800&q=80',
      category: 'Lácteos',
      unitPrice: 35.60,
      wholesalePrice: 26.00,
      discountPercentage: 27,
      minimumUnits: 50,
      committedUnits: 10,
      activeMembers: 1,
      status: OpportunityStatus.OPEN,
      expiresAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 días en el futuro
      supplierId: uSupplier2.id,
      supplierOrigin: 'Buenos Aires, Argentina',
      tags: ['Quesos', 'Fresco', 'Lácteos'],
    });

    // Oportunidad 3: Confirmada (Llegó a la meta)
    const opp3 = opportunityRepository.create({
      title: 'Harina de Trigo Favorita 000 1kg (Pack de 10 paquetes)',
      description: 'Harina de trigo enriquecida tipo triple cero, marca líder. Excelente caducidad, directo de molino.',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      category: 'Alimentos',
      unitPrice: 15.00,
      wholesalePrice: 10.00,
      discountPercentage: 33,
      minimumUnits: 80,
      committedUnits: 90,
      activeMembers: 2,
      status: OpportunityStatus.CONFIRMED,
      expiresAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Expiró hace 2 días
      supplierId: uSupplier1.id,
      supplierOrigin: 'Córdoba, Argentina',
      tags: ['Harinas', 'Almacén', 'Básicos'],
    });

    // Oportunidad 4: Cancelada (Expiró sin llegar a la meta)
    const opp4 = opportunityRepository.create({
      title: 'Leche Larga Vida Entera 1L (Caja cerrada x 12 unidades)',
      description: 'Leche entera ultrapasteurizada enriquecida con vitaminas A y D. Pack ideal para almacenamiento prolongado.',
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
      category: 'Lácteos',
      unitPrice: 24.00,
      wholesalePrice: 16.00,
      discountPercentage: 33,
      minimumUnits: 150,
      committedUnits: 20,
      activeMembers: 1,
      status: OpportunityStatus.CANCELLED,
      expiresAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Expiró hace 1 día
      supplierId: uSupplier2.id,
      supplierOrigin: 'Santa Fe, Argentina',
      tags: ['Leche', 'Desayuno', 'Larga Vida'],
    });

    const [uOpp1, uOpp2, uOpp3, uOpp4] = await opportunityRepository.save([
      opp1,
      opp2,
      opp3,
      opp4,
    ]);
    logger.log('Oportunidades creadas exitosamente.');

    // 5. Creación de Adhesiones mock
    logger.log('Creando adhesiones de los minoristas...');
    const adhesionRepository = dataSource.getRepository(Adhesion);

    // Minorista 1 se adhiere a la Oportunidad 1 (Aceite) - 45 unidades
    const adh1 = adhesionRepository.create({
      userId: uBuyer1.id,
      opportunityId: uOpp1.id,
      quantity: 45,
      totalAmount: 45 * Number(uOpp1.wholesalePrice),
      status: AdhesionStatus.PENDING,
    });

    // Minorista 2 se adhiere a la Oportunidad 2 (Queso) - 10 unidades
    const adh2 = adhesionRepository.create({
      userId: uBuyer2.id,
      opportunityId: uOpp2.id,
      quantity: 10,
      totalAmount: 10 * Number(uOpp2.wholesalePrice),
      status: AdhesionStatus.PENDING,
    });

    // Minorista 1 se adhiere a la Oportunidad 3 (Harina) - 50 unidades (CONFIRMADA)
    const adh3 = adhesionRepository.create({
      userId: uBuyer1.id,
      opportunityId: uOpp3.id,
      quantity: 50,
      totalAmount: 50 * Number(uOpp3.wholesalePrice),
      status: AdhesionStatus.CONFIRMED,
    });

    // Minorista 2 se adhiere a la Oportunidad 3 (Harina) - 40 unidades (CONFIRMADA)
    const adh4 = adhesionRepository.create({
      userId: uBuyer2.id,
      opportunityId: uOpp3.id,
      quantity: 40,
      totalAmount: 40 * Number(uOpp3.wholesalePrice),
      status: AdhesionStatus.CONFIRMED,
    });

    // Minorista 1 se había adherido a la Oportunidad 4 (Leche) - 20 unidades (CANCELADA)
    const adh5 = adhesionRepository.create({
      userId: uBuyer1.id,
      opportunityId: uOpp4.id,
      quantity: 20,
      totalAmount: 20 * Number(uOpp4.wholesalePrice),
      status: AdhesionStatus.CANCELLED,
      cancellationReason: CancellationReason.OPPORTUNITY_EXPIRED,
    });

    const [uAdh1, uAdh2, uAdh3, uAdh4, uAdh5] = await adhesionRepository.save([
      adh1,
      adh2,
      adh3,
      adh4,
      adh5,
    ]);
    logger.log('Adhesiones creadas exitosamente.');

    // 6. Creación de Reseñas mock
    logger.log('Creando valoraciones...');
    const reviewRepository = dataSource.getRepository(Review);

    const rev1 = reviewRepository.create({
      authorId: uBuyer1.id,
      opportunityId: uOpp3.id,
      rating: 5,
      comment: '¡Excelente compra coordinada! Distribuidora Alimentos del Sur cumplió al pie de la letra con el plazo de entrega y la calidad de la harina es insuperable. Recomiendo unirse a este proveedor!',
    });

    await reviewRepository.save(rev1);
    logger.log('Valoraciones creadas exitosamente.');

    // 7. Creación de Notificaciones mock
    logger.log('Creando notificaciones...');
    const notificationRepository = dataSource.getRepository(Notification);

    // Notificaciones para Minorista 1
    const notif1 = notificationRepository.create({
      userId: uBuyer1.id,
      type: 'opportunity_confirmed',
      title: '¡Compra grupal confirmada!',
      message: `¡Excelentes noticias! La oportunidad de "Harina de Trigo Favorita 000 1kg" se ha confirmado. El proveedor ya inició el despacho coordinado.`,
      isRead: false,
      metadata: { opportunityId: uOpp3.id, adhesionId: uAdh3.id },
    });

    const notif2 = notificationRepository.create({
      userId: uBuyer1.id,
      type: 'opportunity_expired',
      title: 'Compra grupal expirada',
      message: `La publicación "Leche Larga Vida Entera 1L" expiró sin alcanzar el mínimo de unidades. Se ha procesado el reembolso virtual a tu cuenta.`,
      isRead: true,
      metadata: { opportunityId: uOpp4.id },
    });

    // Notificación para Proveedor 1
    const notif3 = notificationRepository.create({
      userId: uSupplier1.id,
      type: 'opportunity_confirmed',
      title: '¡Publicación exitosa!',
      message: `Tu oportunidad para "Harina de Trigo Favorita 000 1kg" superó el objetivo mínimo y ha sido cerrada exitosamente con 90 unidades confirmadas.`,
      isRead: false,
      metadata: { opportunityId: uOpp3.id },
    });

    await notificationRepository.save([notif1, notif2, notif3]);
    logger.log('Notificaciones creadas exitosamente.');

    // 8. Creación de Solicitudes de Contacto mock
    logger.log('Creando solicitud de contacto...');
    const contactRepository = dataSource.getRepository(ContactRequest);

    const contact1 = contactRepository.create({
      company: 'Frutas Selectas del Valle',
      category: 'Frescos y Verdulería',
      email: 'contacto@frutasdelvalle.com',
      phone: '+54 11 5555-1234',
      volume: 'Más de 500 cajones semanales',
      message: 'Hola! Somos productores directos y nos interesa enormemente publicar ofertas mayoristas consolidadas para minoristas y almaceneros de barrio en su plataforma. Aguardamos su llamado para coordinar.',
    });

    await contactRepository.save(contact1);
    logger.log('Solicitud de contacto de prueba creada exitosamente.');

    logger.log('¡Proceso de SEEDING finalizado de forma completamente exitosa! 🚀');

  } catch (error) {
    logger.error('Error durante el proceso de seeding:', error);
  } finally {
    // Cerramos el contexto de la aplicación NestJS
    await app.close();
  }
}

runSeed();
