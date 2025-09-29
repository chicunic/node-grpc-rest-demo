# Node.js gRPC/REST API Template

A modern Node.js template for building APIs with both gRPC and REST support, optimized for Google Cloud Platform deployment. This template provides a solid foundation for creating scalable microservices with TypeScript, Express, and gRPC.

## Features

- **Dual Protocol Support**: Both REST API and gRPC endpoints
- **Google Cloud Optimized**: Ready for Cloud Run deployment with Cloud Build CI/CD
- **In-Memory Storage**: Fast in-memory data storage for development and testing
- **TypeScript**: Full type safety and modern JavaScript features
- **OpenAPI/Swagger**: Interactive API documentation
- **gRPC Reflection**: Easy testing with grpcurl
- **Health Checks**: Built-in health check endpoints for both protocols
- **Testing**: Jest test suite with examples
- **Code Quality**: ESLint, Prettier, and pre-commit hooks
- **Docker Support**: Multi-stage production-ready Dockerfile
- **Environment Configuration**: dotenv for configuration management
- **Security**: Non-root container execution and proper signal handling

## Prerequisites

- Node.js >= 22
- pnpm (recommended) or npm

## Quick Start

1. **Clone the repository**

```bash
git clone <repository-url>
cd node-grpc-rest-demo
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

4. **Run in development mode**

REST API:

```bash
pnpm run dev
```

gRPC Server:

```bash
pnpm run dev:grpc
```

## Project Structure

```
├── proto/              # Protocol buffer definitions
├── src/
│   ├── config/        # Configuration files
│   ├── grpc/          # gRPC server and handlers
│   │   ├── handlers/  # gRPC service implementations
│   │   ├── validators/ # gRPC request validators
│   │   └── server.ts  # gRPC server setup
│   ├── routes/        # REST API routes
│   ├── services/      # Business logic layer
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── index.ts       # REST API entry point
├── tests/             # Test files
│   ├── specs/
│   │   ├── integration/ # Integration tests
│   │   ├── unit/       # Unit tests
│   │   └── validator/  # Validator tests
│   └── utils/         # Test utilities
├── swagger.json       # OpenAPI specification
└── package.json       # Dependencies and scripts
```

## Available Scripts

- `pnpm run build` - Build the TypeScript project
- `pnpm run start` - Start the REST API server
- `pnpm run start:grpc` - Start the gRPC server
- `pnpm run dev` - Run REST API in development mode with hot reload
- `pnpm run dev:grpc` - Run gRPC server in development mode
- `pnpm run test` - Run test suite
- `pnpm run test:coverage` - Run tests with coverage report
- `pnpm run test:integration` - Run integration tests only
- `pnpm run lint` - Run ESLint
- `pnpm run format` - Check code formatting
- `pnpm run typecheck` - Run TypeScript type checking
- `pnpm run check` - Run all checks (typecheck, lint, format)
- `pnpm run fix` - Auto-fix code issues

## API Documentation

### REST API

When running in development mode, Swagger UI is available at:

```
http://localhost:8080/api-docs
```

### gRPC

The gRPC server supports reflection for easy testing with grpcurl:

```bash
# List available services
grpcurl -plaintext localhost:8080 list

# Describe a service
grpcurl -plaintext localhost:8080 describe example.UserService

# Call a gRPC method
grpcurl -plaintext -d '{"id":"1"}' localhost:8080 example.UserService/GetUser
```

## Example Services

The template includes two example services to demonstrate the structure:

### User Service

- CRUD operations for user management
- REST endpoints: `/api/v1/users`
- gRPC service: `UserService`
- Input validation using class-validator
- Pagination support

### Product Service

- Product search and management
- REST endpoints: `/api/v1/products`
- gRPC service: `ProductService`
- Input validation using class-validator
- Search by category and price range
- Pagination support

## Testing

The project includes three types of tests:

### Unit Tests

Located in `tests/specs/unit/`, testing isolated services and utility functions.

### Integration Tests

Located in `tests/specs/integration/`, testing complete API endpoints:

- `*.grpc.integration.test.ts` - gRPC service integration tests
- `*.rest.integration.test.ts` - REST API integration tests

### Validator Tests

Located in `tests/specs/validator/`, testing input validation logic:

- `*.grpc.validator.test.ts` - gRPC request validator tests
- `*.rest.validator.test.ts` - REST API validator tests

Run the test suite:

```bash
pnpm run test
```

Run with coverage:

```bash
pnpm run test:coverage
```

Run integration tests only:

```bash
pnpm run test:integration
```

## Docker

Build the Docker image:

```bash
docker build -t node-grpc-rest-demo .
```

Run the container:

```bash
docker run -p 8080:8080 node-grpc-rest-demo
```

## Google Cloud Platform Deployment

### Prerequisites

- Google Cloud Project with billing enabled
- Cloud Build and Cloud Run APIs enabled
- gcloud CLI installed and configured

### Deployment Configuration

The project includes optimized configurations for GCP deployment:

- `deployment/staging.json` - Staging environment configuration
- `deployment/production.json` - Production environment configuration
- `cloudbuild.yaml` - Automated CI/CD pipeline for Cloud Build
- `Dockerfile` - Multi-stage build optimized for Cloud Run

### Branch Strategy

- **main**: Development branch
- **staging**: Automatically deploys to staging environment
- **production**: Automatically deploys to production environment

### Manual Deployment

```bash
# Deploy to Cloud Run (REST API)
gcloud run deploy node-grpc-rest-demo \
  --source . \
  --region us-central1 \
  --platform managed

# Deploy gRPC service
gcloud run deploy node-grpc-rest-demo-grpc \
  --source . \
  --region us-central1 \
  --platform managed \
  --use-http2 \
  --command pnpm \
  --args start:grpc
```

### Automated Deployment with Cloud Build

1. **Connect your repository to Cloud Build**:

```bash
gcloud builds repositories create node-grpc-rest-demo \
  --remote-uri=https://github.com/your-org/node-grpc-rest-demo.git \
  --connection=your-connection-name \
  --region=us-central1
```

2. **Create Cloud Build triggers**:

```bash
# Staging trigger
gcloud builds triggers create github \
  --repo-name=node-grpc-rest-demo \
  --branch-pattern="^staging$" \
  --build-config=cloudbuild.yaml

# Production trigger
gcloud builds triggers create github \
  --repo-name=node-grpc-rest-demo \
  --branch-pattern="^production$" \
  --build-config=cloudbuild.yaml
```

3. **Deploy by pushing to branch**:

```bash
# Deploy to staging
git checkout staging
git merge main
git push origin staging

# Deploy to production
git checkout production
git merge staging
git push origin production
```

### GCP Features Utilized

- **Cloud Run**: Serverless container hosting with automatic scaling
- **Cloud Build**: CI/CD pipeline for automated deployments
- **Container Registry**: Docker image storage
- **Cloud Logging**: Centralized application logs
- **Health Checks**: Startup and liveness probes for reliability
- **HTTP/2 & gRPC**: Full protocol support for modern APIs

## Configuration

Environment variables can be configured in the `.env` file:

### Core Configuration

- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level (default: info)

## Data Storage

### In-Memory Storage

This template uses in-memory storage for data persistence. All data is stored in JavaScript Map objects for fast access:

```typescript
// Create and store data in memory
const user = await userService.createUser({
  username: 'john_doe',
  email: 'john@example.com',
  fullName: 'John Doe',
});
```

**Note**: All data will be lost when the application restarts. This is ideal for development, testing, and prototyping. For production use, consider integrating a persistent database solution.

## Adding New Services

1. Define your proto messages in `proto/`
2. Create service implementation in `src/services/`
3. Add REST routes in `src/routes/`
4. Implement gRPC handlers in `src/grpc/handlers/`
5. Create gRPC validators in `src/grpc/validators/` (using class-validator)
6. Update Swagger documentation in `swagger.json`
7. Add corresponding tests:
   - Unit tests in `tests/specs/unit/`
   - Integration tests in `tests/specs/integration/`
   - Validator tests in `tests/specs/validator/`
8. Services use fast in-memory storage

## Development Tools

- **Type checking**: `pnpm run typecheck`
- **Linting**: `pnpm run lint`
- **Lint with auto-fix**: `pnpm run lint:fix`
- **Format check**: `pnpm run format`
- **Code formatting**: `pnpm run format:fix`
- **Full quality check**: `pnpm run check` (runs typecheck, lint, and format check)
- **Auto-fix all issues**: `pnpm run fix` (runs lint:fix and format:fix)

## Git Hooks

Git hooks are automatically configured when you run `pnpm install`. They ensure code quality before commits and pushes.

## Tech Stack

- **Runtime**: Node.js 22+ (Alpine Linux in production)
- **Language**: TypeScript
- **Frameworks**: Express.js (REST), gRPC
- **Validation**: class-validator, express-openapi-validator
- **Storage**: In-memory storage with JavaScript Map
- **Cloud Platform**: Google Cloud Platform (Cloud Run, Cloud Build)
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier
- **Package Manager**: pnpm
- **Container**: Docker with multi-stage builds

## License

MIT License - see the [LICENSE](LICENSE) file for details
