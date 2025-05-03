/**
 * @file Defines the core Product entity for the domain layer.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

/**
 * @class Product
 * @description Represents a product within the application domain.
 */
export class Product {
  /**
   * @property {string} id - The unique identifier for the product (UUID).
   */
  public readonly id: string;

  /**
   * @property {string} name - The product's name.
   */
  public name: string;

  /**
   * @property {number} price - The product's price.
   */
  public price: number;

  /**
   * @property {boolean} available - Indicates if the product is available for sale.
   */
  public available: boolean;

  /**
   * @constructor
   * @param {string} id
   * @param {string} name
   * @param {number} price
   * @param {boolean} available
   */
  constructor(id: string, name: string, price: number, available: boolean) {
    if (price < 0) {
      throw new Error('Product price cannot be negative.'); // Domain validation example
    }
    this.id = id;
    this.name = name;
    this.price = price;
    this.available = available;
  }

  /**
   * @method updateDetails
   * @description Updates the product's name and price.
   * @param {string} [name] - The new name.
   * @param {number} [price] - The new price.
   */
  public updateDetails(name?: string, price?: number): void {
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        throw new Error('Product name cannot be empty.');
      }
      this.name = name.trim();
    }
    if (price !== undefined) {
        if (price < 0) {
            throw new Error('Product price cannot be negative.');
        }
        this.price = price;
    }
  }

  /**
   * @method markAsUnavailable
   * @description Marks the product as unavailable (soft delete).
   */
   public markAsUnavailable(): void {
       this.available = false;
   }
}