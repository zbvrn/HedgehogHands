// Точка входа

import 'dotenv/config';
import { Pool } from 'pg';
import { NestFactory } from '@nestjs/core';
import {
  HttpException,
  HttpStatus,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ProblemDetailsFilter } from './common/filters/problem-details.filter';


async function ensureDatabaseExists() {
  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT ?? 5432);
  const user = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_DATABASE;

  if (!host || !user || !database) {
    return;
  }

  const pool = new Pool({
    host,
    port,
    user,
    password,
    database: 'postgres',
  });

  try {
    const result = await pool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [database],
    );
    if (result.rowCount === 0) {
      await pool.query(`CREATE DATABASE "${database}"`);
    }
  } finally {
    await pool.end();
  }
}


async function bootstrap() {
  await ensureDatabaseExists();
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });
  
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  
  const swaggerConfig = new DocumentBuilder()
    .setTitle('HedgehogHands API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument, { useGlobalPrefix: false });
  app.enableCors();
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const details = errors
          .map((error) => Object.values(error.constraints ?? {}).join(', '))
          .filter(Boolean)
          .join('; ');
        return new HttpException(
          {
            type: 'about:blank',
            title: 'Validation error',
            status: HttpStatus.BAD_REQUEST,
            detail: details || 'Invalid request payload',
          },
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );
  
  app.useGlobalFilters(new ProblemDetailsFilter());
  
  await app.listen(process.env.PORT ?? 3000);
}
 
bootstrap();
