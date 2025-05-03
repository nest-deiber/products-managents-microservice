/**
 * @file Command handler for updating a product.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Product, ProductRepositoryPort, PRODUCT_REPOSITORY_PORT } from '../../../domain';
import { UpdateProductCommand } from '../impl';

/**
 * @class UpdateProductHandler
 * @description Handles the execution of the UpdateProductCommand.
 */
@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler implements ICommandHandler<UpdateProductCommand, Product> {
  private readonly logger = new Logger(UpdateProductHandler.name);

  /**
   * @constructor
   * @param {ProductRepositoryPort} productRepository - Injected product repository.
   */
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  /**
   * Executes the update product command.
   * @async
   * @param {UpdateProductCommand} command - The command object.
   * @returns {Promise<Product>} The updated product entity.
   * @throws {RpcException} If the product is not found or an error occurs.
   */
  async execute(command: UpdateProductCommand): Promise<Product> {
    const { id, updateProductData } = command;
    this.logger.log(`Attempting to update product with ID: ${id}`);

    try {
      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        throw new RpcException({
          message: `Product with id #${id} not found or not available`,
          status: HttpStatus.NOT_FOUND, // Use 404 for not found
        });
      }

      // Perform the update using the repository port
      const updatedProduct = await this.productRepository.update(id, updateProductData);
      this.logger.log(`Successfully updated product with ID: ${id}`);
      return updatedProduct;

    } catch (error: any) {
      if (error instanceof RpcException) { // Re-throw RpcExceptions directly
          throw error;
      }
      this.logger.error(`Failed to update product ID ${id}: ${error.message}`, error.stack);
      throw new RpcException({
          status: error.status || error.response?.status || 500,
          message: error.message || error.response?.message || 'Failed to update product.',
      });
    }
  }
}