import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.enableCors({ origin: process.env.FE_URL ?? 'http://localhost:3000' });
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  console.warn(`Server running on http://localhost:${port}`);
}

void bootstrap();
