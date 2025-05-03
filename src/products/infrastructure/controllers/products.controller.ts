/**
 * @file NATS controller for handling product-related requests.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Controller, ParseUUIDPipe, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { CreateProductDto, UpdateProductDto, UpdateProductData, FindProductsResponseDto } from '../../application/dto';
import { PaginationDto } from '../../../common';
import { Product } from '../../domain';

import { CreateProductCommand, UpdateProductCommand, DeleteProductCommand } from '../../application/commands/impl';
import { FindAllProductsQuery, FindOneProductQuery, ValidateProductsQuery } from '../../application/queries';

/**
 * @class ProductsController
 * @description Handles incoming NATS messages for product CRUD and validation operations.
 * Uses CommandBus and QueryBus to delegate tasks.
 */
@Controller() // No base path needed for microservice controller usually
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  /**
   * @constructor
   * @param {CommandBus} commandBus - Injected CommandBus.
   * @param {QueryBus} queryBus - Injected QueryBus.
   */
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Handles 'create_product' message.
   * @param {CreateProductDto} createProductDto - Product data.
   * @returns {Promise<Product>} The created product.
   */
  @MessagePattern({ cmd: 'create_product' })
  async create(@Payload() createProductDto: CreateProductDto): Promise<Product> {
    this.logger.log(`Received create_product request: ${JSON.stringify(createProductDto)}`);
    return this.commandBus.execute<CreateProductCommand, Product>(
      new CreateProductCommand(createProductDto),
    );
    // Errors are handled by the global filter
  }

  /**
   * Handles 'find_all_products' message.
   * @param {PaginationDto} paginationDto - Pagination parameters.
   * @returns {Promise<FindProductsResponseDto>} Paginated products.
   */
  @MessagePattern({ cmd: 'find_all_products' })
  async findAll(@Payload() paginationDto: PaginationDto): Promise<FindProductsResponseDto> {
    this.logger.log(`Received find_all_products request: ${JSON.stringify(paginationDto)}`);
    return this.queryBus.execute<FindAllProductsQuery, FindProductsResponseDto>(
      new FindAllProductsQuery(paginationDto),
    );
  }

  /**
   * Handles 'find_one_product' message.
   * @param {string} id - Product ID extracted from payload.
   * @returns {Promise<Product>} The found product.
   */
  @MessagePattern({ cmd: 'find_one_product' })
  async findOne(@Payload('id', ParseUUIDPipe) id: string): Promise<Product> {
      this.logger.log(`Received find_one_product request for ID: ${id}`);
      return this.queryBus.execute<FindOneProductQuery, Product>(
          new FindOneProductQuery(id),
      );
  }

  /**
   * Handles 'update_product' message.
   * @param {UpdateProductDto} updateProductDto - Update payload containing ID and data.
   * @returns {Promise<Product>} The updated product.
   */
  @MessagePattern({ cmd: 'update_product' })
  async update(@Payload() updateProductDto: UpdateProductDto): Promise<Product> {
    this.logger.log(`Received update_product request for ID: ${updateProductDto.id}`);
    const { id, ...updateData } = updateProductDto;
    return this.commandBus.execute<UpdateProductCommand, Product>(
        new UpdateProductCommand(id, updateData as UpdateProductData),
    );
  }

  /**
   * Handles 'delete_product' message.
   * @param {string} id - Product ID extracted from payload.
   * @returns {Promise<Product>} The product marked as unavailable.
   */
  @MessagePattern({ cmd: 'delete_product' })
  async remove(@Payload('id', ParseUUIDPipe) id: string): Promise<Product> {
      this.logger.log(`Received delete_product request for ID: ${id}`);
      return this.commandBus.execute<DeleteProductCommand, Product>(
          new DeleteProductCommand(id),
      );
  }

  /**
   * Handles 'validate_products' message.
   * @param {string[]} ids - Array of product IDs to validate.
   * @returns {Promise<Product[]>} Array of validated products.
   */
  @MessagePattern({ cmd: 'validate_products' })
  async validateProduct(@Payload() ids: string[]): Promise<Product[]> {
      this.logger.log(`Received validate_products request for IDs: ${ids.join(', ')}`);
      return this.queryBus.execute<ValidateProductsQuery, Product[]>(
          new ValidateProductsQuery(ids),
      );
  }
}