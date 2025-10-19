import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // CORS Configuration
  app.enableCors({
    origin: ['http://localhost:3000', 'https://healthcare-dev-platform.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });
  
  // Swagger/OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Tenet Cluster Premium - Healthcare Development Platform')
    .setDescription('Comprehensive API for medical device and pharmaceutical development from concept to approval')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('projects', 'Project management and documentation')
    .addTag('regulatory', 'Regulatory compliance and standards')
    .addTag('clinical', 'Clinical evidence and trial management')
    .addTag('risk', 'Risk assessment and management')
    .addTag('quality', 'Quality management system')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Global Prefix
  app.setGlobalPrefix('api/v1');
  
  await app.listen(process.env.PORT || 3000);
  
  console.log(`🚀 Tenet Cluster Premium running on: ${await app.getUrl()}`);
  console.log(`📚 API Documentation: ${await app.getUrl()}/api/docs`);
}

bootstrap();