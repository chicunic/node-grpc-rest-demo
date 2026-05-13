import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

import type { ProductServiceClient } from "../../src/generated/proto/api/v1/ProductService.js";
import type { UserServiceClient } from "../../src/generated/proto/api/v1/UserService.js";
import type { ProtoGrpcType as ProductProtoGrpcType } from "../../src/generated/proto/product.js";
import type { ProtoGrpcType as UserProtoGrpcType } from "../../src/generated/proto/user.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const USER_PROTO_PATH = path.join(__dirname, "../../api/proto/v1/user.proto");
const PRODUCT_PROTO_PATH = path.join(__dirname, "../../api/proto/v1/product.proto");

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

export interface GrpcTestClient {
  productClient: ProductServiceClient;
  userClient: UserServiceClient;
  server: grpc.Server;
  address: string;
}

export async function createGrpcTestClient(): Promise<GrpcTestClient> {
  const { createGrpcServer } = await import("../../src/grpc/server.js");
  const server = createGrpcServer();

  const port = await new Promise<number>((resolve, reject) => {
    server.bindAsync("127.0.0.1:0", grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(boundPort);
    });
  });

  const address = `127.0.0.1:${port.toString()}`;

  const productClient = new productProto.api.v1.ProductService(address, grpc.credentials.createInsecure());
  const userClient = new userProto.api.v1.UserService(address, grpc.credentials.createInsecure());

  await Promise.all([waitForClientReady(productClient), waitForClientReady(userClient)]);

  return { productClient, userClient, server, address };
}

function waitForClientReady(client: grpc.Client): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = new Date(Date.now() + 5000);
    client.waitForReady(deadline, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function shutdownGrpcTestClient(client: GrpcTestClient): Promise<void> {
  client.productClient.close();
  client.userClient.close();

  return new Promise((resolve) => {
    client.server.tryShutdown(() => {
      resolve();
    });
  });
}

type GrpcMethod<TReq, TRes> = (
  request: TReq,
  callback: (error: grpc.ServiceError | null, response: TRes) => void,
) => grpc.ClientUnaryCall;

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
    fn.call(client, request, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    }),
  );
}
