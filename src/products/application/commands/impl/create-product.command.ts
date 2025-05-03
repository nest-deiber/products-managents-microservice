/**
 * @file Defines the command for creating a new product.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { CreateProductDto } from '../../dto/create-product.dto';

/**
 * @class CreateProductCommand
 * @description Represents the intent to create a new product.
 */
export class CreateProductCommand {
  /**
   * @constructor
   * @param {CreateProductDto} createProductDto - Data for the new product.
   */
  constructor(public readonly createProductDto: CreateProductDto) {}
}