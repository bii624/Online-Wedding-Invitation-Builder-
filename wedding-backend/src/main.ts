import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

// Polyfill for BigInt serialization in JSON.stringify (Prisma returns BigInt for fileSize)
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Online Wedding Invitation Builder API')
    .setDescription(
      'The API documentation for the Online Wedding Invitation Builder backend',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: true, // or your frontend url
    credentials: true,
  });

  const port = process.env.PORT ?? 8000;
  await app.listen(port);

  Logger.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
  Logger.log(
    `Swagger documentation is available at: http://localhost:${port}/api`,
    'Bootstrap',
  );
}
bootstrap();
