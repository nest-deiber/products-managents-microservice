/**
 * @file Defines the query for validating the existence of multiple products.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

/**
 * @class ValidateProductsQuery
 * @description Represents the intent to validate if a list of product IDs exist and are available.
 */
export class ValidateProductsQuery {
  /**
   * @constructor
   * @param {string[]} ids - An array of product IDs to validate.
   */
  constructor(public readonly ids: string[]) {}
}