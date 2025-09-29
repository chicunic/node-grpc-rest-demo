/**
 * gRPC test server utilities
 */
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROTO_PATH = path.join(__dirname, '../../proto/example.proto');

// Load proto file for client
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const example = (grpc.loadPackageDefinition(packageDefinition) as grpc.GrpcObject).example as grpc.GrpcObject;

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
  const { createGrpcServer } = await import('../../src/grpc/server');
  const server = createGrpcServer();

  // Start server on random port
  const port = await new Promise<number>((resolve, reject) => {
    server.bindAsync('127.0.0.1:0', grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(boundPort);
    });
  });

  const address = `127.0.0.1:${port}`;

  // Create clients
  const productClient = new (example.ProductService as grpc.ServiceClientConstructor)(
    address,
    grpc.credentials.createInsecure()
  );
  const userClient = new (example.UserService as grpc.ServiceClientConstructor)(
    address,
    grpc.credentials.createInsecure()
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

// Waits for a gRPC client to be ready
function waitForClientReady(client: grpc.Client): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = new Date(Date.now() + 5000); // 5 second timeout
    client.waitForReady(deadline, (err?: Error) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Shuts down the test gRPC server and clients
export async function shutdownGrpcTestClient(client: GrpcTestClient): Promise<void> {
  // Close clients
  client.productClient.close();
  client.userClient.close();

  // Shutdown server
  return new Promise(resolve => {
    client.server.tryShutdown(() => {
      resolve();
    });
  });
}

type GrpcMethod<TReq, TRes> = (
  request: TReq,
  callback: (error: grpc.ServiceError | null, response: TRes) => void
) => grpc.ClientUnaryCall;

// Helper to promisify gRPC calls
export function promisifyGrpcCall<TRequest, TResponse>(
  client: grpc.Client,
  method: string,
  request: TRequest
): Promise<TResponse> {
  const fn = (client as grpc.Client & Record<string, GrpcMethod<TRequest, TResponse>>)[method];
  if (!fn) {
    return Promise.reject(new Error(`Method ${method} not found on gRPC client`));
  }

  return new Promise((resolve, reject) =>
    fn.call(client, request, (error, response) => (error ? reject(error) : resolve(response)))
  );
}
