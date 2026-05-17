import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  // Guardamos la fecha de inicio del servidor para calcular el uptime
  private readonly startTime = Date.now();

  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000), // Uptime en segundos
    };
  }
}
