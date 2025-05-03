/**
 * @file Defines the command for deleting (soft deleting) a product.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

/**
 * @class DeleteProductCommand
 * @description Represents the intent to soft delete a product.
 */
export class DeleteProductCommand {
  /**
   * @constructor
   * @param {string} id - The ID of the product to delete.
   */
  constructor(public readonly id: string) {}
}