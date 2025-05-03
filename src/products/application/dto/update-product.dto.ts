/**
 * @file Data Transfer Object for updating a product. Includes the ID.
 * @description Used primarily as the raw input payload from NATS.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsString, IsUUID } from 'class-validator';

/**
 * @class UpdateProductDto
 * @extends PartialType(CreateProductDto)
 * @description Defines the shape for update payloads, inheriting optional name/price
 * and requiring the product ID.
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {
  /**
   * @property {string} id - The ID of the product to update.
   * @decorator IsString
   * @decorator IsUUID
   */
  @IsString()
  @IsUUID()
  id: string;
}

/**
 * @type UpdateProductData
 * @description Represents the data part of the update, excluding the ID.
 */
export type UpdateProductData = Omit<UpdateProductDto, 'id'>;