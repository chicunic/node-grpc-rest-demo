import path, { dirname } from "node:path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ReflectionService } from "@grpc/reflection";
import dotenv from "dotenv";
import { HealthImplementation } from "grpc-health-check";
import "reflect-metadata";
import { fileURLToPath } from "node:url";

import { createStructuredLogger } from "../config/logger";
import { productServiceImplementation } from "./handlers/product.handler";
import { userServiceImplementation } from "./handlers/user.handler";

const __dirname = dirname(fileURLToPath(import.meta.url));
const USER_PROTO_PATH = path.join(__dirname, "../../api/proto/v1/user.proto");
const PRODUCT_PROTO_PATH = path.join(__dirname, "../../api/proto/v1/product.proto");
const logger = createStructuredLogger("grpc-server");

// Load proto files
const protoOptions: protoLoader.Options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const userPackageDefinition = protoLoader.loadSync(USER_PROTO_PATH, protoOptions);
const productPackageDefinition = protoLoader.loadSync(PRODUCT_PROTO_PATH, protoOptions);

const userProto = (grpc.loadPackageDefinition(userPackageDefinition) as grpc.GrpcObject).api as grpc.GrpcObject;
const productProto = (grpc.loadPackageDefinition(productPackageDefinition) as grpc.GrpcObject).api as grpc.GrpcObject;
const v1User = userProto.v1 as grpc.GrpcObject;
const v1Product = productProto.v1 as grpc.GrpcObject;

export function createGrpcServer(): grpc.Server {
  const server = new grpc.Server();

  // Add user service
  server.addService((v1User.UserService as grpc.ServiceClientConstructor).service, userServiceImplementation);

  // Add product service
  server.addService((v1Product.ProductService as grpc.ServiceClientConstructor).service, productServiceImplementation);

  // Add health check service
  const healthImpl = new HealthImplementation();
  healthImpl.setStatus("", "SERVING");
  healthImpl.setStatus("api.v1.UserService", "SERVING");
  healthImpl.setStatus("api.v1.ProductService", "SERVING");

  healthImpl.addToServer(server);

  // Enable reflection for grpcurl testing
  // Merge package definitions for reflection
  const mergedPackageDefinition = {
    ...userPackageDefinition,
    ...productPackageDefinition,
  };
  const reflectionImpl = new ReflectionService(mergedPackageDefinition);
  reflectionImpl.addToServer(server);

  return server;
}

export function startGrpcServer(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const server = createGrpcServer();

    server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
      if (err) {
        reject(err);
        return;
      }

      logger.info(`gRPC server bound to port ${boundPort}`);
      resolve();
    });
  });
}

// Main execution when run directly (ESM equivalent)
if (import.meta.url === `file://${process.argv[1]}`) {
  dotenv.config();

  // Set default NODE_ENV if not specified
  process.env.NODE_ENV ??= "development";

  const port = process.env.PORT ?? 8080;

  logger.info("Starting gRPC server...");

  startGrpcServer(Number(port))
    .then(() => {
      logger.info(`gRPC server started successfully on port ${port}`);
    })
    .catch((error) => {
      logger.error("Failed to start gRPC server", error);
      process.exit(1);
    });
}
