/**
 * @file Command handler for creating a product.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { Product, ProductRepositoryPort, PRODUCT_REPOSITORY_PORT } from '../../../domain';
import { CreateProductCommand } from '../impl';

/**
 * @class CreateProductHandler
 * @description Handles the execution of the CreateProductCommand.
 */
@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand, Product> {
  private readonly logger = new Logger(CreateProductHandler.name);

  /**
   * @constructor
   * @param {ProductRepositoryPort} productRepository - Injected product repository.
   */
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  /**
   * Executes the create product command.
   * @async
   * @param {CreateProductCommand} command - The command object.
   * @returns {Promise<Product>} The created product entity.
   * @throws {RpcException} If an error occurs during creation.
   */
  async execute(command: CreateProductCommand): Promise<Product> {
    const { name, price } = command.createProductDto;
    this.logger.log(`Attempting to create product: ${name}`);

    try {
      // Generate UUID externally
      const id = randomUUID();
      this.logger.log(`Generated product UUID: ${id}`);
      
      // Pass the ID along with the other data
      const newProduct = await this.productRepository.create({ id, name, price });
      this.logger.log(`Successfully created product with ID: ${newProduct.id}`);
      return newProduct;
    } catch (error: any) {
      this.logger.error(`Failed to create product "${name}": ${error.message}`, error.stack);
      throw new RpcException({
          status: error.status || error.response?.status || 500,
          message: error.message || error.response?.message || 'Failed to create product.',
      });
    }
  }
}