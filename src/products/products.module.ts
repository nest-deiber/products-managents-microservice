/**
 * @file Products module definition.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Application Layer
import { CommandHandlers } from './application/commands';
import { QueryHandlers } from './application/queries';

// Domain Layer (Ports)
import { PRODUCT_REPOSITORY_PORT } from './domain';

// Infrastructure Layer (Adapters & Controller)
import { PrismaProductRepository } from './infrastructure/adapters/prisma-product.repository';
import { ProductsController } from './infrastructure/controllers/products.controller';
// PrismaService is provided globally via PrismaModule

/**
 * @const {Provider[]} infrastructureProviders
 * @description Provides the implementation for the domain repository port.
 */
const infrastructureProviders: Provider[] = [
  {
    provide: PRODUCT_REPOSITORY_PORT,
    useClass: PrismaProductRepository,
  },
];

/**
 * @const {Provider[]} applicationProviders
 * @description Registers command and query handlers with CQRS.
 */
const applicationProviders: Provider[] = [
    ...CommandHandlers,
    ...QueryHandlers,
];

/**
 * @module ProductsModule
 * @description Encapsulates the product feature using CQRS and Hexagonal Architecture.
 */
@Module({
  imports: [CqrsModule],
  controllers: [ProductsController],
  providers: [
    ...applicationProviders,
    ...infrastructureProviders,
  ],
})
export class ProductsModule {}