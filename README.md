# Node.js gRPC REST Demo

A Node.js backend template demonstrating User and Product services with CRUD APIs, accessible via:

1. **REST API** - Express framework
2. **gRPC API** - Native gRPC with Protocol Buffers

## Features

- **UserService**: Create, Read, Update, Delete, List users
- **ProductService**: Create, Read, Update, Delete, Search products with filtering
- **Dual Protocol**: REST (HTTP/JSON) and gRPC support
- **Protocol Buffers**: Single source of truth for API definitions
- **Type Safety**: Full TypeScript support with class-validator
- **Graceful Shutdown**: Proper signal handling
- **Thread-Safe**: Concurrent-safe in-memory storage

## Quick Start

### Prerequisites

- Node.js >= 22
- pnpm (recommended) or npm
- (Optional) `grpcurl` for testing gRPC endpoints

### Run the Server

```bash
# Install dependencies
pnpm install

# Run REST API server
pnpm run dev
```

Or run gRPC server:

```bash
pnpm run dev:grpc
```

Server endpoints:

- REST API: <http://localhost:8080/api/v1/>
- gRPC: localhost:8080
- Health check: <http://localhost:8080/health>

## API Endpoints

### REST API (`/api/v1`)

| Method | Endpoint           | Description                      |
| ------ | ------------------ | -------------------------------- |
| GET    | `/health`          | Health check                     |
| POST   | `/users`           | Create user                      |
| GET    | `/users`           | List users (with pagination)     |
| GET    | `/users/:id`       | Get user by ID                   |
| PUT    | `/users/:id`       | Update user                      |
| DELETE | `/users/:id`       | Delete user                      |
| POST   | `/products`        | Create product                   |
| GET    | `/products/:id`    | Get product by ID                |
| PUT    | `/products/:id`    | Update product                   |
| DELETE | `/products/:id`    | Delete product                   |
| GET    | `/products/search` | Search products (multi-criteria) |

### gRPC Services (port 8080)

| Service        | Methods                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| UserService    | CreateUser, GetUser, UpdateUser, DeleteUser, ListUsers                  |
| ProductService | CreateProduct, GetProduct, UpdateProduct, DeleteProduct, SearchProducts |

## Testing gRPC with grpcurl

```bash
# List available services
grpcurl -plaintext localhost:8080 list

# Describe a service
grpcurl -plaintext localhost:8080 describe api.v1.UserService

# Call a gRPC method
grpcurl -plaintext -d '{"id":"<user-id>"}' localhost:8080 api.v1.UserService/GetUser

# Create a user
grpcurl -plaintext -d '{"username":"john","email":"john@example.com","full_name":"John Doe"}' \
  localhost:8080 api.v1.UserService/CreateUser
```

## Available Scripts

```bash
pnpm run build             # Build TypeScript project (auto-runs proto:types via prebuild)
pnpm run start             # Start REST API server (tsx)
pnpm run start:grpc        # Start gRPC server (tsx)
pnpm run start:prod        # Start REST API from compiled dist/
pnpm run dev               # Run REST API with hot reload
pnpm run dev:grpc          # Run gRPC server with hot reload
pnpm run proto:types       # Generate TypeScript types from .proto files
pnpm run test              # Run unit test suite
pnpm run test:watch        # Run tests in watch mode
pnpm run test:coverage     # Run tests with coverage report
pnpm run test:integration  # Run integration test suite
pnpm run check             # Type check + ESLint + Prettier check
pnpm run fix               # Auto-fix ESLint + Prettier issues
```

## Project Structure

```text
node-grpc-rest-demo/
├── api/
│   └── proto/v1/       # Protocol Buffer definitions
├── src/
│   ├── grpc/           # gRPC server and handlers
│   │   ├── handlers/   # gRPC service implementations
│   │   ├── validators/ # gRPC request validators
│   │   └── server.ts   # gRPC server setup
│   ├── routes/         # REST API routes
│   ├── services/       # Business logic layer
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── index.ts        # REST API entry point
├── tests/              # Test files
│   ├── specs/
│   │   ├── integration/ # Integration tests
│   │   ├── unit/        # Unit tests
│   │   └── validator/   # Validator tests
│   └── utils/          # Test utilities
└── package.json        # Dependencies and scripts
```

## License

MIT
