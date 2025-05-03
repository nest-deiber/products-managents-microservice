/**
 * @file Defines the query for finding all available products with pagination.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { PaginationDto } from '../../../../common/dto/pagination.dto';

/**
 * @class FindAllProductsQuery
 * @description Represents the intent to find all available products.
 */
export class FindAllProductsQuery {
  /**
   * @constructor
   * @param {PaginationDto} paginationDto - Pagination parameters.
   */
  constructor(public readonly paginationDto: PaginationDto) {}
}