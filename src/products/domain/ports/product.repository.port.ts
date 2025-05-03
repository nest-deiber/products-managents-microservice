/**
 * @file Defines the port (interface) for product repository operations.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Product } from '../model/product.entity';
import { PaginationDto } from '../../../common';

/**
 * @interface PaginatedProductResult
 * @description Structure for returning paginated product data.
 */
export interface PaginatedProductResult {
  data: Product[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

/**
 * @interface ProductRepositoryPort
 * @description Defines the contract for product repository adapters.
 */
export interface ProductRepositoryPort {
  /**
   * Creates a new product.
   * @async
   * @param {ProductCreateData} productData - Data for the new product.
   * @returns {Promise<Product>} The created product entity.
   */
  create(productData: ProductCreateData): Promise<Product>;

  /**
   * Finds a product by its ID, only if available.
   * @async
   * @param {string} id - The ID of the product to find.
   * @returns {Promise<Product | null>} The product entity or null if not found/unavailable.
   */
  findById(id: string): Promise<Product | null>;

  /**
   * Finds all available products with pagination.
   * @async
   * @param {PaginationDto} paginationDto - Pagination parameters (page, limit).
   * @returns {Promise<PaginatedProductResult>} Paginated list of available products.
   */
  findAllAvailablePaginated(paginationDto: PaginationDto): Promise<PaginatedProductResult>;

  /**
   * Updates an existing product.
   * @async
   * @param {string} id - The ID of the product to update.
   * @param {Partial<Omit<Product, 'id' | 'available'>>} updateData - The data to update.
   * @returns {Promise<Product>} The updated product entity.
   * @throws {Error} If the product to update is not found.
   */
  update(id: string, updateData: Partial<Omit<Product, 'id' | 'available'>>): Promise<Product>;

  /**
   * Soft deletes a product by marking it as unavailable.
   * @async
   * @param {string} id - The ID of the product to soft delete.
   * @returns {Promise<Product>} The product entity marked as unavailable.
   * @throws {Error} If the product to delete is not found.
   */
  softDelete(id: string): Promise<Product>;

   /**
    * Finds multiple products by their IDs, checking availability.
    * @async
    * @param {string[]} ids - An array of product IDs to find.
    * @returns {Promise<Product[]>} A promise resolving with the found available products.
    */
   findAvailableByIds(ids: string[]): Promise<Product[]>;
}

/**
 * @type ProductCreateData
 * @description Data type needed to create a product
 */
export type ProductCreateData = {
  id: string;
  name: string;
  price: number;
};

/**
 * @const {string} PRODUCT_REPOSITORY_PORT
 * @description Injection token for the ProductRepositoryPort.
 */
export const PRODUCT_REPOSITORY_PORT = 'ProductRepositoryPort';