# Node.js gRPC REST 演示项目

一个 Node.js 后端模板，演示用户和产品服务的 CRUD API，支持两种访问方式：

1. **REST API** - 基于 Express 框架
2. **gRPC API** - 原生 gRPC，使用 Protocol Buffers

## 特性

- **用户服务**：增删改查、列表查询
- **产品服务**：增删改查、多条件搜索
- **双协议支持**：REST (HTTP/JSON) 和 gRPC
- **Protocol Buffers**：API 定义的单一真相源
- **类型安全**：完整的 TypeScript 支持和 class-validator 验证
- **优雅关闭**：正确处理系统信号
- **线程安全**：并发安全的内存存储

## 快速开始

### 前置要求

- Node.js >= 22
- pnpm（推荐）或 npm
- （可选）`grpcurl` 用于测试 gRPC 端点

### 运行服务器

```bash
# 安装依赖
pnpm install

# 运行 REST API 服务器
pnpm run dev
```

或运行 gRPC 服务器：

```bash
pnpm run dev:grpc
```

服务端点：

- REST API：<http://localhost:8080/api/v1/>
- gRPC：localhost:8080
- 健康检查：<http://localhost:8080/health>

## API 端点

### REST API (`/api/v1`)

| 方法   | 端点               | 描述                 |
| ------ | ------------------ | -------------------- |
| GET    | `/health`          | 健康检查             |
| POST   | `/users`           | 创建用户             |
| GET    | `/users`           | 用户列表（支持分页） |
| GET    | `/users/:id`       | 获取用户             |
| PUT    | `/users/:id`       | 更新用户             |
| DELETE | `/users/:id`       | 删除用户             |
| POST   | `/products`        | 创建产品             |
| GET    | `/products/:id`    | 获取产品             |
| PUT    | `/products/:id`    | 更新产品             |
| DELETE | `/products/:id`    | 删除产品             |
| GET    | `/products/search` | 搜索产品（多条件）   |

### gRPC 服务 (端口 8080)

| 服务           | 方法                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| UserService    | CreateUser, GetUser, UpdateUser, DeleteUser, ListUsers                  |
| ProductService | CreateProduct, GetProduct, UpdateProduct, DeleteProduct, SearchProducts |

## 使用 grpcurl 测试 gRPC

```bash
# 列出可用服务
grpcurl -plaintext localhost:8080 list

# 描述服务
grpcurl -plaintext localhost:8080 describe api.v1.UserService

# 调用 gRPC 方法
grpcurl -plaintext -d '{"id":"<用户ID>"}' localhost:8080 api.v1.UserService/GetUser

# 创建用户
grpcurl -plaintext -d '{"username":"john","email":"john@example.com","full_name":"John Doe"}' \
  localhost:8080 api.v1.UserService/CreateUser
```

## 可用脚本

```bash
pnpm run build             # 构建 TypeScript 项目（prebuild 会自动跑 proto:types）
pnpm run start             # 启动 REST API 服务器（tsx）
pnpm run start:grpc        # 启动 gRPC 服务器（tsx）
pnpm run start:prod        # 从编译后的 dist/ 启动 REST API
pnpm run dev               # 热重载运行 REST API
pnpm run dev:grpc          # 热重载运行 gRPC 服务器
pnpm run proto:types       # 从 .proto 文件生成 TypeScript 类型
pnpm run test              # 运行单元测试
pnpm run test:watch        # 监听模式运行测试
pnpm run test:coverage     # 运行带覆盖率报告的测试
pnpm run test:integration  # 运行集成测试
pnpm run check             # 类型检查 + ESLint + Prettier 检查
pnpm run fix               # 自动修复 ESLint + Prettier 问题
```

## 项目结构

```text
node-grpc-rest-demo/
├── api/
│   └── proto/v1/       # Protocol Buffer 定义
├── src/
│   ├── grpc/           # gRPC 服务器和处理器
│   │   ├── handlers/   # gRPC 服务实现
│   │   ├── validators/ # gRPC 请求验证器
│   │   └── server.ts   # gRPC 服务器设置
│   ├── routes/         # REST API 路由
│   ├── services/       # 业务逻辑层
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数
│   └── index.ts        # REST API 入口点
├── tests/              # 测试文件
│   ├── specs/
│   │   ├── integration/ # 集成测试
│   │   ├── unit/        # 单元测试
│   │   └── validator/   # 验证器测试
│   └── utils/          # 测试工具
└── package.json        # 依赖和脚本
```

## 许可证

MIT
