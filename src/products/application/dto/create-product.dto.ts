/**
 * @file Data Transfer Object for creating a product.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Type } from 'class-transformer';
import { IsNumber, IsString, Min } from 'class-validator';

/**
 * @class CreateProductDto
 * @description Defines the shape of data for creating a new product.
 */
export class CreateProductDto {
  /**
   * @property {string} name - Product name.
   * @decorator IsString
   */
  @IsString()
  public name: string;

  /**
   * @property {number} price - Product price. Must be a non-negative number.
   * @decorator IsNumber
   * @decorator Min
   * @decorator Type
   */
  @IsNumber({
    maxDecimalPlaces: 4, // Keep original constraint
  })
  @Min(0)
  @Type(() => Number)
  public price: number;
}