/**
 * @file Query handler for finding a single product by ID.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Product, ProductRepositoryPort, PRODUCT_REPOSITORY_PORT } from '../../../domain';
import { FindOneProductQuery } from '../impl/find-one-product.query';

/**
 * @class FindOneProductHandler
 * @description Handles the execution of the FindOneProductQuery.
 */
@QueryHandler(FindOneProductQuery)
export class FindOneProductHandler implements IQueryHandler<FindOneProductQuery, Product> {
  private readonly logger = new Logger(FindOneProductHandler.name);

  /**
   * @constructor
   * @param {ProductRepositoryPort} productRepository - Injected product repository.
   */
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  /**
   * Executes the find one product query.
   * @async
   * @param {FindOneProductQuery} query - The query object containing the product ID.
   * @returns {Promise<Product>} The found product entity.
   * @throws {RpcException} If the product is not found or an error occurs.
   */
  async execute(query: FindOneProductQuery): Promise<Product> {
    const { id } = query;
    this.logger.log(`Finding product with ID: ${id}`);

    try {
      const product = await this.productRepository.findById(id);

      if (!product) {
        throw new RpcException({
          message: `Product with id #${id} not found or not available`,
          status: HttpStatus.NOT_FOUND, // Use 404 for not found
        });
      }

      return product;
    } catch (error: any) {
        if (error instanceof RpcException) { // Re-throw RpcExceptions directly
            throw error;
        }
       this.logger.error(`Failed to find product ID ${id}: ${error.message}`, error.stack);
       throw new RpcException({
           status: error.status || error.response?.status || 500,
           message: error.message || error.response?.message || 'Failed to retrieve product.',
       });
    }
  }
}