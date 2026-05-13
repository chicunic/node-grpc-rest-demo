import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ReflectionService } from "@grpc/reflection";
import dotenv from "dotenv";
import { HealthImplementation } from "grpc-health-check";
import "reflect-metadata";

import { createStructuredLogger } from "../config/logger.js";
import type { ProtoGrpcType as ProductProtoGrpcType } from "../generated/proto/product.js";
import type { ProtoGrpcType as UserProtoGrpcType } from "../generated/proto/user.js";
import { productServiceImplementation } from "./handlers/product.handler.js";
import { userServiceImplementation } from "./handlers/user.handler.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const USER_PROTO_PATH = path.join(__dirname, "../../api/proto/v1/user.proto");
const PRODUCT_PROTO_PATH = path.join(__dirname, "../../api/proto/v1/product.proto");
const logger = createStructuredLogger("grpc-server");

const protoOptions: protoLoader.Options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const userPackageDefinition = protoLoader.loadSync(USER_PROTO_PATH, protoOptions);
const productPackageDefinition = protoLoader.loadSync(PRODUCT_PROTO_PATH, protoOptions);

const userProto = grpc.loadPackageDefinition(userPackageDefinition) as unknown as UserProtoGrpcType;
const productProto = grpc.loadPackageDefinition(productPackageDefinition) as unknown as ProductProtoGrpcType;

export function createGrpcServer(): grpc.Server {
  const server = new grpc.Server();

  server.addService(userProto.api.v1.UserService.service, userServiceImplementation);
  server.addService(productProto.api.v1.ProductService.service, productServiceImplementation);

  const healthImpl = new HealthImplementation();
  healthImpl.setStatus("", "SERVING");
  healthImpl.setStatus("api.v1.UserService", "SERVING");
  healthImpl.setStatus("api.v1.ProductService", "SERVING");
  healthImpl.addToServer(server);

  const reflectionImpl = new ReflectionService({ ...userPackageDefinition, ...productPackageDefinition });
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

if (import.meta.url === `file://${process.argv[1]}`) {
  dotenv.config();
  process.env.NODE_ENV ??= "development";

  const port = process.env.PORT ?? 8080;
  logger.info("Starting gRPC server...");

  startGrpcServer(Number(port))
    .then(() => {
      logger.info(`gRPC server started successfully on port ${port}`);
    })
    .catch((error: unknown) => {
      logger.error("Failed to start gRPC server", error instanceof Error ? error : { error });
      process.exit(1);
    });
}
