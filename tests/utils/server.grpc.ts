/**
 * gRPC test server utilities
 */

import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const __dirname = dirname(fileURLToPath(import.meta.url));
const USER_PROTO_PATH = path.join(__dirname, "../../api/proto/v1/user.proto");
const PRODUCT_PROTO_PATH = path.join(__dirname, "../../api/proto/v1/product.proto");

// Load proto files for client
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

export interface GrpcTestClient {
  productClient: grpc.Client;
  userClient: grpc.Client;
  server: grpc.Server;
  address: string;
}

// Creates a test gRPC server and clients for testing
// Uses the real gRPC server implementation for integration testing
export async function createGrpcTestClient(): Promise<GrpcTestClient> {
  // Import the real gRPC server factory
  const { createGrpcServer } = await import("../../src/grpc/server");
  const server = createGrpcServer();

  // Start server on random port
  const port = await new Promise<number>((resolve, reject) => {
    server.bindAsync("127.0.0.1:0", grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(boundPort);
    });
  });

  const address = `127.0.0.1:${port}`;

  // Create clients
  const productClient = new (v1Product.ProductService as grpc.ServiceClientConstructor)(
    address,
    grpc.credentials.createInsecure(),
  );
  const userClient = new (v1User.UserService as grpc.ServiceClientConstructor)(
    address,
    grpc.credentials.createInsecure(),
  );

  // Wait for clients to be ready
  await Promise.all([waitForClientReady(productClient), waitForClientReady(userClient)]);

  return {
    productClient,
    userClient,
    server,
    address,
  };
}

function waitForClientReady(client: grpc.Client): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = new Date(Date.now() + 5000);
    client.waitForReady(deadline, (err) => (err ? reject(err) : resolve()));
  });
}

export async function shutdownGrpcTestClient(client: GrpcTestClient): Promise<void> {
  client.productClient.close();
  client.userClient.close();

  return new Promise((resolve) => {
    client.server.tryShutdown(() => resolve());
  });
}

type GrpcMethod<TReq, TRes> = (
  request: TReq,
  callback: (error: grpc.ServiceError | null, response: TRes) => void,
) => grpc.ClientUnaryCall;

// Helper to promisify gRPC calls
export function promisifyGrpcCall<TRequest, TResponse>(
  client: grpc.Client,
  method: string,
  request: TRequest,
): Promise<TResponse> {
  const fn = (client as grpc.Client & Record<string, GrpcMethod<TRequest, TResponse>>)[method];
  if (!fn) {
    return Promise.reject(new Error(`Method ${method} not found on gRPC client`));
  }

  return new Promise((resolve, reject) =>
    fn.call(client, request, (error, response) => (error ? reject(error) : resolve(response))),
  );
}
