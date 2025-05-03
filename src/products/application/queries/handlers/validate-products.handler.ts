/**
 * @file Query handler for validating multiple products.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Product, ProductRepositoryPort, PRODUCT_REPOSITORY_PORT } from '../../../domain';
import { ValidateProductsQuery } from '../impl/validate-products.query';

/**
 * @class ValidateProductsHandler
 * @description Handles the execution of the ValidateProductsQuery.
 */
@QueryHandler(ValidateProductsQuery)
export class ValidateProductsHandler implements IQueryHandler<ValidateProductsQuery, Product[]> {
  private readonly logger = new Logger(ValidateProductsHandler.name);

  /**
   * @constructor
   * @param {ProductRepositoryPort} productRepository - Injected product repository.
   */
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  /**
   * Executes the validate products query.
   * @async
   * @param {ValidateProductsQuery} query - The query object containing the product IDs.
   * @returns {Promise<Product[]>} An array of the validated (found and available) product entities.
   * @throws {RpcException} If some products are not found or an error occurs.
   */
  async execute(query: ValidateProductsQuery): Promise<Product[]> {
    // Ensure unique IDs
    const uniqueIds = Array.from(new Set(query.ids));
    this.logger.log(`Validating product IDs: ${uniqueIds.join(', ')}`);

    if (uniqueIds.length === 0) {
        return []; // No IDs to validate
    }

    try {
      const products = await this.productRepository.findAvailableByIds(uniqueIds);

      if (products.length !== uniqueIds.length) {
          const foundIds = products.map(p => p.id);
          const missingIds = uniqueIds.filter(id => !foundIds.includes(id));
          this.logger.warn(`Validation failed: Missing product IDs: ${missingIds.join(', ')}`);
          throw new RpcException({
            message: `Some products were not found or are unavailable: ${missingIds.join(', ')}`,
            status: HttpStatus.BAD_REQUEST, // Or NOT_FOUND depending on desired behavior
          });
      }

      this.logger.log(`Successfully validated ${products.length} products.`);
      return products;

    } catch (error: any) {
        if (error instanceof RpcException) { // Re-throw RpcExceptions directly
            throw error;
        }
        this.logger.error(`Failed during product validation: ${error.message}`, error.stack);
        throw new RpcException({
            status: error.status || error.response?.status || 500,
            message: error.message || error.response?.message || 'Failed to validate products.',
        });
    }
  }
}