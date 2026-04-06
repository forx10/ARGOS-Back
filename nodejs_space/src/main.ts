import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('ARGOS API')
    .setDescription(
      'Sistema de asistencia personal con control de horarios, bloqueos de apps y sitios, y gestión de alarmas automáticas.',
    )
    .setVersion('1.0')
    .addTag('Turnos', 'Gestión de turnos rotativos')
    .addTag('Bloqueo', 'Control de bloqueos de apps y sitios')
    .addTag('Webhook', 'Eventos desde Tasker/AutoRemote')
    .addTag('Estado', 'Consultar estado actual')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Middleware to prevent caching of Swagger docs
  const apiDocsPath = 'api-docs';
  app.use(`/${apiDocsPath}`, (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  SwaggerModule.setup(apiDocsPath, app, document, {
    customSiteTitle: 'ARGOS API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
      presets: [
        require('swagger-ui-dist/swagger-ui-bundle'),
        require('swagger-ui-dist/swagger-ui-standalone-preset'),
      ],
    },
  });

  await app.listen(3000, '0.0.0.0');
  console.log('✅ ARGOS Backend running on http://0.0.0.0:3000');
  console.log('📚 API Documentation: http://localhost:3000/api-docs');
}

bootstrap();
