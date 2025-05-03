/**
 * @file Defines the query for finding a single product by ID.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

/**
 * @class FindOneProductQuery
 * @description Represents the intent to find a single available product by its ID.
 */
export class FindOneProductQuery {
  /**
   * @constructor
   * @param {string} id - The ID of the product to find.
   */
  constructor(public readonly id: string) {}
}