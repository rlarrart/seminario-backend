import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Creamos la aplicación NestJS
  const app = await NestFactory.create(AppModule);

  // Obtenemos el servicio de configuración
  const configService = app.get(ConfigService);

  // Aseguramos la existencia de los directorios para archivos estáticos
  const publicDir = join(process.cwd(), 'public');
  const uploadsDir = join(publicDir, 'uploads');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  // Servimos la carpeta public de forma estática
  app.use('/public', express.static(publicDir));

  // Configuramos el prefijo global para la API
  app.setGlobalPrefix('api');

  // Configuramos la validación global de los DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve propiedades que no estén en el DTO
      transform: true, // Transforma los tipos automáticamente (ej: string a number)
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
    }),
  );

  // Configuramos CORS dinámicamente según la variable de entorno
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Escuchamos en el puerto configurado
  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
  
  logger.log(`Aplicación MiniMax Backend escuchando en: http://localhost:${port}/api`);
}

bootstrap();
