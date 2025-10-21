import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { SupabaseExceptionFilter } from './supabase/types/supabase-exception.filter';
import * as dotenv from 'dotenv';

dotenv.config();
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new SupabaseExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: 'http://localhost:5000',
    credentials: true,
  });

  // 🔧 Swagger config
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('The backend API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT', // Optional, for clarity
        description: 'Enter your Supabase access token',
      },
      'supabase-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ? Number(process.env.PORT) : 5001;
  await app.listen(port);
  logger.log(
    `🚀 Nest application successfully started on http://localhost:${port}`,
  );

  const outputPath = join(process.cwd(), 'swagger-spec.json');
  writeFileSync(outputPath, JSON.stringify(document, null, 2));
  logger.log('Swagger spec saved to swagger-spec.json');
}
void bootstrap();
