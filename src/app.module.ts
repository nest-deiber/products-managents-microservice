/**
 * @file Root application module for Products MS.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';

/**
 * @module AppModule
 * @description The root module, importing feature and shared modules.
 */
@Module({
  imports: [
      PrismaModule, // Provides PrismaService globally
      ProductsModule,
    ],
  controllers: [],
  providers: [],
})
export class AppModule {}