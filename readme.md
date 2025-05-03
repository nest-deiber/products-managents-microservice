# Products Microservice (`products-managements-microservice`)

## 1. Overview

This project implements a Products Microservice using **NestJS**. It is designed following **Clean Architecture (Hexagonal Architecture)** principles combined with the **Command Query Responsibility Segregation (CQRS)** pattern. The primary purpose of this microservice is to manage product information within a larger system.

Its core responsibilities include:

* Creating new products.
* Retrieving individual products by ID.
* Retrieving lists of available products with pagination.
* Updating existing product details.
* Soft-deleting products (marking them as unavailable).
* Validating the existence and availability of multiple product IDs.

Communication is handled via the **NATS** messaging transport. The service utilizes **Prisma** as its ORM (configured for SQLite in the provided code) for data persistence.

The architecture emphasizes **maintainability, testability, scalability, and a clear separation of concerns**, reflecting best practices for modern microservice development.

---

## 2. Architectural Approach

This microservice employs a combination of **Clean Architecture (Hexagonal)** and **CQRS** to structure its codebase effectively.

### 2.1. Clean Architecture / Hexagonal Architecture

This architectural style isolates the application's core business logic from external dependencies like frameworks, databases, or UI. It achieves this through distinct layers:

* **Domain Layer (`src/products/domain`):** Contains the core business logic, including the `Product` entity and the definition of interfaces (Ports) like `ProductRepositoryPort` that dictate how the outside world interacts with domain data. This layer is framework-agnostic.
* **Application Layer (`src/products/application`):** Orchestrates the application's use cases. It defines Commands (write operations) and Queries (read operations), along with their respective Handlers. It also includes Data Transfer Objects (DTOs) for data validation and shaping. This layer depends only on the Domain layer.
* **Infrastructure Layer (`src/products/infrastructure`, `src/shared/infrastructure`, `src/config`):** Contains the implementation details specific to external tools and frameworks. This includes:
    * **Adapters (`src/products/infrastructure/adapters`):** Concrete implementations of the Domain Ports (e.g., `PrismaProductRepository` interacting with the database via Prisma).
    * **Controllers (`src/products/infrastructure/controllers`):** Entry points for external interactions (e.g., `ProductsController` handling NATS messages).
    * **Framework Modules:** NestJS modules (`*.module.ts`), configuration loading, database connections, global filters/interceptors.

**Key Benefits:**

* **Testability:** Domain and Application layers can be unit-tested without needing a database or NATS connection.
* **Maintainability:** Changes to external dependencies (e.g., switching ORM, changing transport layer) are localized within the Infrastructure layer.
* **Flexibility:** Easier to adapt or replace infrastructure components due to the Port/Adapter abstraction.

### 2.2. CQRS (Command Query Responsibility Segregation)

Implemented using `@nestjs/cqrs`, CQRS separates operations that modify data (Commands) from those that read data (Queries).

* **Commands:** Represent intents to change state (Create, Update, Delete Product). Handled by dedicated `CommandHandlers`.
* **Queries:** Represent requests for data (FindAll, FindOne, Validate Products). Handled by dedicated `QueryHandlers`.

**Why CQRS?**

* **Separation of Concerns:** Clearly distinguishes write logic from read logic, improving code organization.
* **Optimized Data Models:** Enables potential future optimization where read models might differ from write models for performance (though not implemented currently).
* **Scalability:** Facilitates independent scaling of command processing and query processing workloads.
* **Clarity of Intent:** Makes the purpose of each operation explicit.

### 2.3. Synergy: Clean Architecture + CQRS

The combination provides a robust foundation:

* Clean Architecture dictates the dependency flow (Infrastructure -> Application -> Domain).
* CQRS structures the Application layer logic into focused, single-responsibility handlers.
* Domain Ports serve as the contracts connecting Application handlers to Infrastructure adapters.

---

## 3. Project Structure

The `src` directory is organized as follows:

```
src/
├── products/                 # Main Feature Module: Products
│   ├── application/          # Use Cases, CQRS, DTOs
│   │   ├── commands/         # Write Operations
│   │   │   ├── handlers/     # --> CreateProductHandler, UpdateProductHandler, DeleteProductHandler
│   │   │   └── impl/         # --> CreateProductCommand, UpdateProductCommand, DeleteProductCommand
│   │   ├── queries/          # Read Operations
│   │   │   ├── handlers/     # --> FindAllProductsHandler, FindOneProductHandler, ValidateProductsHandler
│   │   │   └── impl/         # --> FindAllProductsQuery, FindOneProductQuery, ValidateProductsQuery
│   │   └── dto/              # --> CreateProductDto, UpdateProductDto, FindProductsResponseDto
│   ├── domain/                 # Core Business Logic & Abstractions
│   │   ├── model/            # --> Product Entity (Product.ts)
│   │   └── ports/            # --> ProductRepositoryPort Interface
│   └── infrastructure/         # Implementation Details
│       ├── adapters/         # --> PrismaProductRepository
│       └── controllers/      # --> ProductsController (NATS)
├── common/                   # Common DTOs across modules
│   └── dto/                  # --> PaginationDto
├── config/                   # Configuration Loading & Validation (envs.ts)
├── shared/                   # Shared Infrastructure Code
│   └── infrastructure/
│       ├── filters/          # --> AllExceptionsFilter
│       ├── interceptors/     # --> ResponseSanitizerInterceptor
│       └── prisma/           # --> PrismaModule, PrismaService
├── app.module.ts             # Root Application Module
└── main.ts                   # Application Bootstrap
```

*(Note: `@author` and `@date` tags pointing to "Roberto Morales" and "2025-05-01" are present in most source files and should ideally be removed or updated for submission).*

---

## 4. Key Technologies & Dependencies

* **Node.js:** JavaScript runtime.
* **TypeScript:** Language providing static typing.
* **NestJS (`@nestjs/*`):** Core framework for building efficient and scalable server-side applications.
* **Prisma (`@prisma/client`, `prisma`):** Next-generation ORM for Node.js and TypeScript.
* **NATS (`nats`):** Messaging system for microservice communication.
* **CQRS (`@nestjs/cqrs`):** NestJS module for implementing the CQRS pattern.
* **Class Validator / Class Transformer:** For declarative validation and transformation of DTOs.
* **Dotenv / Joi:** For loading and validating environment variables.

---

## 5. Setup and Running

### 5.1. Prerequisites

* Node.js (v16.13 or later recommended)
* NPM or Yarn
* NATS Server instance running and accessible.
* A database compatible with the Prisma schema (default is SQLite file).

### 5.2. Installation

```bash
npm install
# or
yarn install
```

### 5.3. Environment Configuration

Create a `.env` file in the project root. See `src/config/envs.ts` for required variables:

```dotenv
# .env example
PORT=3001 # Port for potential health checks, etc.

# NATS Configuration
NATS_SERVERS=nats://localhost:4222 # Comma-separated list

# Database Connection URL (used by Prisma)
DATABASE_URL="file:./dev.db"
```

### 5.4. Database Migrations (Prisma)

Apply migrations and generate the Prisma client:

```bash
# Apply migrations (creates DB if it doesn't exist) & generate client
npx prisma migrate dev --name init

# Or, if only client generation is needed after schema changes:
npx prisma generate
```
*(The `docker:start` script in `package.json` combines these steps).*

### 5.5. Running the Service

* **Development (with hot-reloading):**
    ```bash
    # Ensure NATS server is running first
    npm run start:dev
    ```
    *(Note: `start:dev` also runs `docker:start` which executes prisma commands).*

* **Production Build:**
    ```bash
    npm run build
    npm run start:prod
    ```

The service will connect to the specified NATS server(s).

---

## 6. API (NATS Message Patterns)

The `ProductsController` listens for the following NATS message patterns:

1.  **`{ cmd: 'create_product' }`**
    * **Payload:** `CreateProductDto` (`{ name: string, price: number }`)
    * **Response:** `Product` entity on success, `RpcException` on failure.

2.  **`{ cmd: 'find_all_products' }`**
    * **Payload:** `PaginationDto` (`{ page?: number, limit?: number }`)
    * **Response:** `FindProductsResponseDto` (`{ data: Product[], meta: { total, page, lastPage } }`) on success, `RpcException` on failure.

3.  **`{ cmd: 'find_one_product' }`**
    * **Payload:** `{ id: string }` (ID must be a valid UUID)
    * **Response:** `Product` entity on success, `RpcException` (e.g., 404) if not found or unavailable.

4.  **`{ cmd: 'update_product' }`**
    * **Payload:** `UpdateProductDto` (`{ id: string, name?: string, price?: number }`) (ID must be a valid UUID)
    * **Response:** Updated `Product` entity on success, `RpcException` on failure (e.g., 404 if not found).

5.  **`{ cmd: 'delete_product' }`**
    * **Payload:** `{ id: string }` (ID must be a valid UUID)
    * **Response:** Product entity (marked as unavailable) on success, `RpcException` on failure (e.g., 404 if not found).

6.  **`{ cmd: 'validate_products' }`**
    * **Payload:** `string[]` (Array of product IDs)
    * **Response:** `Product[]` (Array of found and available products) on success. Throws `RpcException` (e.g., 400) if any requested product ID is not found or unavailable.

---

## 7. Error Handling

* **Standardized RPC Errors:** Uses `RpcException` from `@nestjs/microservices` for errors intended for clients.
* **Global Exception Filter:** The `AllExceptionsFilter` catches all exceptions, logging them internally and returning a standardized error object (`{ status, message, timestamp }`) over NATS.
* **Input Validation:** DTOs combined with the global `ValidationPipe` ensure that incoming payloads adhere to defined constraints (`class-validator` decorators) before reaching controllers or handlers.

---

## 8. Best Practices Employed

* **Dependency Injection:** Heavily utilized via NestJS.
* **Separation of Concerns:** Enforced by Clean Architecture layers and CQRS.
* **Interface-Based Design (Ports & Adapters):** Promotes loose coupling and testability.
* **Configuration Management:** Centralized loading and validation of environment variables.
* **Type Safety:** Leveraged through TypeScript and Prisma's generated client.
* **DTOs & Validation:** Clear data contracts and validation at boundaries.
* **Asynchronous Programming:** Consistent use of `async/await`.
* **Centralized Logging:** Basic setup using NestJS `Logger`.
* **Soft Deletes:** Products are marked as unavailable (`available: false`) instead of being physically deleted, preserving data integrity.

---

## 9. Future Considerations & Scalability

* **Database Optimization:** For high read volume, introduce read replicas and potentially separate read/write database connections, facilitated by the CQRS pattern.
* **Caching:** Implement caching strategies (e.g., Redis) for frequently accessed products or queries (`find_all_products`, `find_one_product`).
* **Domain Events:** Introduce domain events (e.g., `ProductCreatedEvent`, `ProductPriceChangedEvent`) using `@nestjs/cqrs` to decouple actions further and enable reactive workflows (e.g., updating search indices, notifying other services).
* **Enhanced Validation:** Add more complex business validation rules within the Domain entities or dedicated Domain Services.
* **Observability:** Integrate distributed tracing (e.g., OpenTelemetry) and more detailed metrics for production monitoring.