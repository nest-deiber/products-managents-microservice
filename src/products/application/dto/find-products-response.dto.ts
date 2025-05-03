/**
 * @file Data Transfer Object for the paginated find all products response.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Product } from '../../domain/model/product.entity';

/**
 * @class FindProductsResponseDto
 * @description Structure of the paginated response for finding products.
 */
export class FindProductsResponseDto {
  /**
   * @property {Product[]} data - Array of product entities for the current page.
   */
  data: Product[];

  /**
   * @property {object} meta - Pagination metadata.
   * @property {number} meta.total - Total number of available products.
   * @property {number} meta.page - Current page number.
   * @property {number} meta.lastPage - The last page number.
   */
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}