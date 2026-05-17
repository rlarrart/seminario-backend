import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

// Importación de módulos
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { AdhesionsModule } from './modules/adhesions/adhesions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ContactModule } from './modules/contact/contact.module';

// Importación de entidades
import { User } from './modules/users/entities/user.entity';
import { Opportunity } from './modules/opportunities/entities/opportunity.entity';
import { Adhesion } from './modules/adhesions/entities/adhesion.entity';
import { Notification } from './modules/notifications/entities/notification.entity';
import { Review } from './modules/reviews/entities/review.entity';
import { ContactRequest } from './modules/contact/entities/contact-request.entity';

@Module({
  imports: [
    // Cargamos las variables de entorno de forma global
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configuramos TypeORM de forma asíncrona usando el servicio de configuración
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'minimax_dev'),
        entities: [User, Opportunity, Adhesion, Notification, Review, ContactRequest],
        synchronize: true, // Sincroniza automáticamente el esquema (solo para desarrollo)
        logging: false,
      }),
    }),

    // Inicializamos el módulo de tareas programadas (Schedule) para cron jobs
    ScheduleModule.forRoot(),

    // Registro de los submódulos de la aplicación
    HealthModule,
    UsersModule,
    AuthModule,
    OpportunitiesModule,
    AdhesionsModule,
    NotificationsModule,
    ReviewsModule,
    ContactModule,
  ],
})
export class AppModule {}
