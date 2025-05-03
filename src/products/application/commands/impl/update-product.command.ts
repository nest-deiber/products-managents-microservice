/**
 * @file Defines the command for updating an existing product.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { UpdateProductData } from '../../dto/update-product.dto';

/**
 * @class UpdateProductCommand
 * @description Represents the intent to update a product.
 */
export class UpdateProductCommand {
  /**
   * @constructor
   * @param {string} id - The ID of the product to update.
   * @param {UpdateProductData} updateProductData - The data to update the product with.
   */
  constructor(
    public readonly id: string,
    public readonly updateProductData: UpdateProductData,
  ) {}
}