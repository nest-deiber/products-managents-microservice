/**
 * @file Application entry point for Products Microservice.
 * @author Roberto Morales
 * @version 1.1.0
 * @date 2025-05-01
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter, ResponseSanitizerInterceptor } from './shared/infrastructure';

/**
 * @function bootstrap
 * @description Initializes and starts the Products microservice.
 * @async
 */
async function bootstrap() {
  const logger = new Logger('Main-ProductsMS');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers,
      },
    },
  );

  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Apply Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());
  logger.log('Applied global RPC exception filter.');

  // Apply Global Interceptor
  app.useGlobalInterceptors(new ResponseSanitizerInterceptor());
  logger.log('Applied global response sanitizer interceptor.');

  await app.listen();
  logger.log(`Products Microservice is listening on NATS servers: ${envs.natsServers.join(', ')}`);
  logger.log(`Products Microservice running on port ${ envs.port }`);
}
bootstrap();