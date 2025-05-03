/**
 * @file Query handler for finding all available products with pagination.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ProductRepositoryPort, PRODUCT_REPOSITORY_PORT, PaginatedProductResult } from '../../../domain';
import { FindAllProductsQuery } from '../impl/find-all-products.query';
import { FindProductsResponseDto } from '../../dto/find-products-response.dto'; // Use the specific response DTO


/**
 * @class FindAllProductsHandler
 * @description Handles the execution of the FindAllProductsQuery.
 */
@QueryHandler(FindAllProductsQuery)
export class FindAllProductsHandler implements IQueryHandler<FindAllProductsQuery, FindProductsResponseDto> {
    private readonly logger = new Logger(FindAllProductsHandler.name);

    /**
     * @constructor
     * @param {ProductRepositoryPort} productRepository - Injected product repository.
     */
    constructor(
        @Inject(PRODUCT_REPOSITORY_PORT)
        private readonly productRepository: ProductRepositoryPort,
    ) {}

    /**
     * Executes the find all products query.
     * @async
     * @param {FindAllProductsQuery} query - The query object containing pagination data.
     * @returns {Promise<FindProductsResponseDto>} Paginated list of available products.
     * @throws {RpcException} If an error occurs during retrieval.
     */
    async execute(query: FindAllProductsQuery): Promise<FindProductsResponseDto> {
        const { paginationDto } = query;
        this.logger.log(`Finding all products with pagination: page=${paginationDto.page}, limit=${paginationDto.limit}`);

        try {
            const paginatedResult: PaginatedProductResult = await this.productRepository.findAllAvailablePaginated(paginationDto);

            // Directly return the structure from the repository port which matches the DTO
            return paginatedResult;

        } catch (error: any) {
             this.logger.error(`Failed to find all products: ${error.message}`, error.stack);
            throw new RpcException({ status: 500, message: 'Database error finding products.' });
        }
    }
}