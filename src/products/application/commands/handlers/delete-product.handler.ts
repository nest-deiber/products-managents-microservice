/**
 * @file Command handler for soft deleting a product.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Product, ProductRepositoryPort, PRODUCT_REPOSITORY_PORT } from '../../../domain';
import { DeleteProductCommand } from '../impl/delete-product.command';

/**
 * @class DeleteProductHandler
 * @description Handles the execution of the DeleteProductCommand (soft delete).
 */
@CommandHandler(DeleteProductCommand)
export class DeleteProductHandler implements ICommandHandler<DeleteProductCommand, Product> {
  private readonly logger = new Logger(DeleteProductHandler.name);

  /**
   * @constructor
   * @param {ProductRepositoryPort} productRepository - Injected product repository.
   */
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  /**
   * Executes the soft delete product command.
   * @async
   * @param {DeleteProductCommand} command - The command object.
   * @returns {Promise<Product>} The product entity marked as unavailable.
   * @throws {RpcException} If the product is not found or an error occurs.
   */
  async execute(command: DeleteProductCommand): Promise<Product> {
    const { id } = command;
    this.logger.log(`Attempting to soft delete product with ID: ${id}`);

    try {
        const existingProduct = await this.productRepository.findById(id);
        if (!existingProduct) {
          throw new RpcException({
            message: `Product with id #${id} not found or already unavailable`,
            status: HttpStatus.NOT_FOUND, // Use 404 for not found
          });
        }

        // Perform the soft delete using the repository port
        const deletedProduct = await this.productRepository.softDelete(id);
        this.logger.log(`Successfully soft deleted product with ID: ${id}`);
        return deletedProduct;

    } catch (error: any) {
        if (error instanceof RpcException) { // Re-throw RpcExceptions directly
            throw error;
        }
        this.logger.error(`Failed to soft delete product ID ${id}: ${error.message}`, error.stack);
        throw new RpcException({
            status: error.status || error.response?.status || 500,
            message: error.message || error.response?.message || 'Failed to delete product.',
        });
    }
  }
}