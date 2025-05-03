import { FindAllProductsHandler } from './handlers/find-all-products.handler';
import { FindOneProductHandler } from './handlers/find-one-product.handler';
import { ValidateProductsHandler } from './handlers/validate-products.handler';

export * from './impl/find-all-products.query';
export * from './impl/find-one-product.query';
export * from './impl/validate-products.query';

export const QueryHandlers = [
  FindAllProductsHandler,
  FindOneProductHandler,
  ValidateProductsHandler,
];