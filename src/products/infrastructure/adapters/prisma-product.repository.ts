/**
 * @file Prisma adapter implementing the ProductRepositoryPort.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Product } from '../../domain/model/product.entity';
import { ProductRepositoryPort, PaginatedProductResult, ProductCreateData } from '../../domain/ports/product.repository.port';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/**
 * @class PrismaProductRepository
 * @implements ProductRepositoryPort
 * @description Implements product persistence logic using Prisma ORM with SQLite.
 */
@Injectable()
export class PrismaProductRepository implements ProductRepositoryPort {
  private readonly logger = new Logger(PrismaProductRepository.name);

  /**
   * @constructor
   * @param {PrismaService} prisma - Injected PrismaService instance.
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Maps a Prisma Product model to a domain Product entity.
   * @private
   * @param {any} prismaProduct - The product object retrieved from Prisma.
   * @returns {Product | null} The corresponding domain Product entity. Returns null if input is null/undefined.
   */
  private mapToDomain(prismaProduct: any): Product | null {
    if (!prismaProduct) {
      return null;
    }
    return new Product(
      prismaProduct.id,
      prismaProduct.name,
      prismaProduct.price, 
      prismaProduct.available,
    );
  }

  /**
   * Maps domain Product data for Prisma create operation.
   * @private
   * @param {ProductCreateData} productData - Product data from domain/application.
   * @returns {any} Data suitable for Prisma create.
   */
   private mapToPrismaCreateData(productData: ProductCreateData): any {
    return {
      id: productData.id, // Use the externally provided ID
      name: productData.name,
      price: productData.price, // Prisma handles Float conversion from number
      // 'available' defaults to true in schema if not provided
    };
  }

   /**
    * Maps domain Product data for Prisma update operation.
    * @private
    * @param {Partial<Omit<Product, 'id' | 'available'>>} productData - Product data from domain/application.
    * @returns {any} Data suitable for Prisma update.
    */
    private mapToPrismaUpdateData(productData: Partial<Omit<Product, 'id' | 'available'>>): any {
        const data: any = {};
        if (productData.name !== undefined) data.name = productData.name;
        if (productData.price !== undefined) data.price = productData.price; // Prisma handles Float conversion
        // 'available' is handled by softDelete
        return data;
    }

  /**
   * Creates a new product using Prisma.
   * @async
   * @param {ProductCreateData} productData - Data for the new product.
   * @returns {Promise<Product>} The created domain Product entity.
   */
  async create(productData: ProductCreateData): Promise<Product> {
    const prismaData = this.mapToPrismaCreateData(productData);
    try {
      const createdPrismaProduct = await this.prisma.product.create({
        data: prismaData,
      });
      return this.mapToDomain(createdPrismaProduct);
    } catch (error: any) {
      this.logger.error(`Error creating product: ${error.message}`, error.stack);
      throw new RpcException({ status: 500, message: 'Database error creating product.' });
    }
  }

  /**
   * Finds an available product by its ID using Prisma.
   * @async
   * @param {string} id - The ID of the product to find.
   * @returns {Promise<Product | null>} A promise resolving with the domain Product entity or null.
   */
  async findById(id: string): Promise<Product | null> {
    try {
      const prismaProduct = await this.prisma.product.findFirst({
        where: { 
          id: id,
          available: true 
        },
      });
      return this.mapToDomain(prismaProduct);
    } catch (error: any) {
      this.logger.error(`Error finding product by ID ${id}: ${error.message}`, error.stack);
      // Return null, let handler decide if it's a 404 or 500
      return null;
    }
  }

  /**
   * Finds all available products with pagination using Prisma.
   * @async
   * @param {PaginationDto} paginationDto - Pagination parameters.
   * @returns {Promise<PaginatedProductResult>} Paginated list of available domain Product entities.
   */
  async findAllAvailablePaginated(paginationDto: PaginationDto): Promise<PaginatedProductResult> {
    const { page = 1, limit = 10 } = paginationDto; // Provide defaults
    const skip = (page - 1) * limit;

    try {
        const [totalAvailable, prismaProducts] = await this.prisma.$transaction([
             this.prisma.product.count({ where: { available: true } }),
             this.prisma.product.findMany({
                skip: skip,
                take: limit,
                where: { available: true },
             }),
        ]);

        const lastPage = Math.ceil(totalAvailable / limit);
        const domainProducts = prismaProducts.map(p => this.mapToDomain(p));

        return {
            data: domainProducts,
            meta: {
                total: totalAvailable,
                page: page,
                lastPage: lastPage,
            },
        };
    } catch (error: any) {
         this.logger.error(`Error finding all products: ${error.message}`, error.stack);
         throw new RpcException({ status: 500, message: 'Database error finding products.' });
    }
  }

  /**
   * Updates a product using Prisma. Assumes existence check was done prior.
   * @async
   * @param {string} id - The ID of the product to update.
   * @param {Partial<Omit<Product, 'id' | 'available'>>} updateData - The data to update.
   * @returns {Promise<Product>} The updated domain Product entity.
   */
  async update(id: string, updateData: Partial<Omit<Product, 'id' | 'available'>>): Promise<Product> {
     const prismaData = this.mapToPrismaUpdateData(updateData);
     
     if (Object.keys(prismaData).length === 0) {
         // If no actual data to update, fetch and return current state to avoid unnecessary DB call
         const currentProduct = await this.findById(id);
         if (!currentProduct) throw new Error(`Product #${id} not found for update check.`); // Should have been checked by handler
         return currentProduct;
     }

     try {
        const updatedPrismaProduct = await this.prisma.product.update({
            where: { id }, // Update only works if product exists
            data: prismaData,
        });
        return this.mapToDomain(updatedPrismaProduct);
     } catch (error: any) { // Catch specific Prisma errors like P2025 (RecordNotFound)
        this.logger.error(`Error updating product ID ${id}: ${error.message}`, error.stack);
         if (error.code === 'P2025') {
              throw new RpcException({ status: 404, message: `Product with ID ${id} not found for update.` });
         }
        throw new RpcException({ status: 500, message: 'Database error updating product.' });
     }
  }

  /**
   * Soft deletes a product by setting 'available' to false using Prisma.
   * Assumes existence check was done prior.
   * @async
   * @param {string} id - The ID of the product to soft delete.
   * @returns {Promise<Product>} The domain Product entity marked as unavailable.
   */
  async softDelete(id: string): Promise<Product> {
    try {
        const updatedPrismaProduct = await this.prisma.product.update({
            where: { id }, // Delete only works if product exists
            data: { available: false },
        });
        return this.mapToDomain(updatedPrismaProduct);
    } catch (error: any) { // Catch specific Prisma errors like P2025
        this.logger.error(`Error soft deleting product ID ${id}: ${error.message}`, error.stack);
        if (error.code === 'P2025') {
             throw new RpcException({ status: 404, message: `Product with ID ${id} not found for deletion.` });
        }
        throw new RpcException({ status: 500, message: 'Database error deleting product.' });
    }
  }

   /**
    * Finds available products matching the given IDs using Prisma.
    * @async
    * @param {string[]} ids - An array of product IDs to find.
    * @returns {Promise<Product[]>} A promise resolving with the found available domain Product entities.
    */
   async findAvailableByIds(ids: string[]): Promise<Product[]> {
        if (!ids || ids.length === 0) {
            return [];
        }
        try {
            const uniqueIds = Array.from(new Set(ids)); // Ensure unique IDs
            
            const prismaProducts = await this.prisma.product.findMany({
                where: {
                    id: { in: uniqueIds },
                    available: true,
                },
            });
            
            return prismaProducts.map(p => this.mapToDomain(p));
        } catch (error: any) {
            this.logger.error(`Error finding products by IDs: ${error.message}`, error.stack);
            throw new RpcException({ status: 500, message: 'Database error finding products by IDs.' });
        }
   }
}