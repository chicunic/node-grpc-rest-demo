# Node.js gRPC/REST API 模板

一个现代化的 Node.js API 模板，支持 gRPC 和 REST 双协议，针对 Google Cloud Platform 部署进行了优化。该模板为构建可扩展的微服务提供了坚实的基础，采用 TypeScript、Express 和 gRPC 技术栈。

## 特性

- **双协议支持**：同时提供 REST API 和 gRPC 端点
- **Google Cloud 优化**：为 Cloud Run 部署和 Cloud Build CI/CD 做好准备
- **内存存储**：快速的内存数据存储，适用于开发和测试
- **TypeScript**：完整的类型安全和现代 JavaScript 特性
- **OpenAPI/Swagger**：交互式 API 文档
- **gRPC 反射**：使用 grpcurl 轻松测试
- **健康检查**：为两种协议提供内置的健康检查端点
- **测试套件**：包含示例的 Jest 测试套件
- **代码质量**：ESLint、Prettier 和预提交钩子
- **Docker 支持**：多阶段生产就绪的 Dockerfile
- **环境配置**：使用 dotenv 进行配置管理
- **安全性**：非 root 容器执行和正确的信号处理

## 先决条件

- Node.js >= 22
- pnpm（推荐）或 npm

## 快速开始

1. **克隆仓库**

```bash
git clone <repository-url>
cd node-grpc-rest-demo
```

2. **安装依赖**

```bash
pnpm install
```

3. **设置环境变量**

```bash
cp .env.example .env
```

4. **在开发模式下运行**

REST API：

```bash
pnpm run dev
```

gRPC 服务器：

```bash
pnpm run dev:grpc
```

## 项目结构

```
├── proto/              # Protocol Buffer 定义
├── src/
│   ├── config/        # 配置文件
│   ├── grpc/          # gRPC 服务器和处理器
│   │   ├── handlers/  # gRPC 服务实现
│   │   ├── validators/ # gRPC 请求验证器
│   │   └── server.ts  # gRPC 服务器设置
│   ├── routes/        # REST API 路由
│   ├── services/      # 业务逻辑层
│   ├── types/         # TypeScript 类型定义
│   ├── utils/         # 工具函数
│   └── index.ts       # REST API 入口点
├── tests/             # 测试文件
│   ├── specs/
│   │   ├── integration/ # 集成测试
│   │   ├── unit/       # 单元测试
│   │   └── validator/  # 验证器测试
│   └── utils/         # 测试工具
├── swagger.json       # OpenAPI 规范
└── package.json       # 依赖和脚本
```

## 可用脚本

- `pnpm run build` - 构建 TypeScript 项目
- `pnpm run start` - 启动 REST API 服务器
- `pnpm run start:grpc` - 启动 gRPC 服务器
- `pnpm run dev` - 以热重载模式运行 REST API
- `pnpm run dev:grpc` - 在开发模式下运行 gRPC 服务器
- `pnpm run test` - 运行测试套件
- `pnpm run test:coverage` - 运行带覆盖率报告的测试
- `pnpm run test:integration` - 仅运行集成测试
- `pnpm run lint` - 运行 ESLint
- `pnpm run format` - 检查代码格式
- `pnpm run typecheck` - 运行 TypeScript 类型检查
- `pnpm run check` - 运行所有检查（typecheck、lint、format）
- `pnpm run fix` - 自动修复代码问题

## API 文档

### REST API

在开发模式下运行时，可通过以下地址访问 Swagger UI：

```
http://localhost:8080/api-docs
```

### gRPC

gRPC 服务器支持反射，便于使用 grpcurl 进行测试：

```bash
# 列出可用服务
grpcurl -plaintext localhost:8080 list

# 描述服务
grpcurl -plaintext localhost:8080 describe example.UserService

# 调用 gRPC 方法
grpcurl -plaintext -d '{"id":"1"}' localhost:8080 example.UserService/GetUser
```

## 示例服务

模板包含两个示例服务来演示结构：

### 用户服务

- 用户管理的 CRUD 操作
- REST 端点：`/api/v1/users`
- gRPC 服务：`UserService`
- 输入验证：使用 class-validator 进行请求验证
- 支持分页查询

### 产品服务

- 产品搜索和管理
- REST 端点：`/api/v1/products`
- gRPC 服务：`ProductService`
- 输入验证：使用 class-validator 进行请求验证
- 支持按类别和价格范围搜索
- 支持分页查询

## 测试

项目包含三种类型的测试：

### 单元测试

位于 `tests/specs/unit/` 目录，测试独立的服务和工具函数。

### 集成测试

位于 `tests/specs/integration/` 目录，测试完整的 API 端点：

- `*.grpc.integration.test.ts` - gRPC 服务集成测试
- `*.rest.integration.test.ts` - REST API 集成测试

### 验证器测试

位于 `tests/specs/validator/` 目录，测试输入验证逻辑：

- `*.grpc.validator.test.ts` - gRPC 请求验证器测试
- `*.rest.validator.test.ts` - REST API 验证器测试

运行测试套件：

```bash
pnpm run test
```

运行带覆盖率的测试：

```bash
pnpm run test:coverage
```

仅运行集成测试：

```bash
pnpm run test:integration
```

## Docker

构建 Docker 镜像：

```bash
docker build -t node-grpc-rest-demo .
```

运行容器：

```bash
docker run -p 8080:8080 node-grpc-rest-demo
```

## Google Cloud Platform 部署

### 先决条件

- 启用计费的 Google Cloud 项目
- 启用 Cloud Build 和 Cloud Run API
- 安装并配置 gcloud CLI

### 部署配置

项目包含针对 GCP 部署优化的配置：

- `deployment/staging.json` - 预发布环境配置
- `deployment/production.json` - 生产环境配置
- `cloudbuild.yaml` - Cloud Build 的自动化 CI/CD 管道
- `Dockerfile` - 为 Cloud Run 优化的多阶段构建

### 分支策略

- **main**：开发分支
- **staging**：自动部署到预发布环境
- **production**：自动部署到生产环境

### 手动部署

```bash
# 部署到 Cloud Run（REST API）
gcloud run deploy node-grpc-rest-demo \
  --source . \
  --region us-central1 \
  --platform managed

# 部署 gRPC 服务
gcloud run deploy node-grpc-rest-demo-grpc \
  --source . \
  --region us-central1 \
  --platform managed \
  --use-http2 \
  --command pnpm \
  --args start:grpc
```

### 使用 Cloud Build 自动部署

1. **将仓库连接到 Cloud Build**：

```bash
gcloud builds repositories create node-grpc-rest-demo \
  --remote-uri=https://github.com/your-org/node-grpc-rest-demo.git \
  --connection=your-connection-name \
  --region=us-central1
```

2. **创建 Cloud Build 触发器**：

```bash
# 预发布触发器
gcloud builds triggers create github \
  --repo-name=node-grpc-rest-demo \
  --branch-pattern="^staging$" \
  --build-config=cloudbuild.yaml

# 生产触发器
gcloud builds triggers create github \
  --repo-name=node-grpc-rest-demo \
  --branch-pattern="^production$" \
  --build-config=cloudbuild.yaml
```

3. **通过推送到分支进行部署**：

```bash
# 部署到预发布环境
git checkout staging
git merge main
git push origin staging

# 部署到生产环境
git checkout production
git merge staging
git push origin production
```

### 使用的 GCP 功能

- **Cloud Run**：具有自动扩缩的无服务器容器托管
- **Cloud Build**：用于自动部署的 CI/CD 管道
- **Container Registry**：Docker 镜像存储
- **Cloud Logging**：集中式应用日志
- **健康检查**：启动和存活探针确保可靠性
- **HTTP/2 和 gRPC**：完整支持现代 API 协议

## 配置

可以在 `.env` 文件中配置环境变量：

### 核心配置

- `PORT` - 服务器端口（默认：8080）
- `NODE_ENV` - 环境（development/production）
- `LOG_LEVEL` - 日志级别（默认：info）

## 数据存储

### 内存存储

此模板使用内存存储进行数据持久化。所有数据都存储在 JavaScript Map 对象中以实现快速访问：

```typescript
// 在内存中创建和存储数据
const user = await userService.createUser({
  username: 'john_doe',
  email: 'john@example.com',
  fullName: 'John Doe',
});
```

**注意**：应用程序重启时所有数据都会丢失。这对于开发、测试和原型设计是理想的。生产环境请考虑集成持久化数据库解决方案。

## 添加新服务

1. 在 `proto/` 中定义你的 proto 消息
2. 在 `src/services/` 中创建服务实现
3. 在 `src/routes/` 中添加 REST 路由
4. 在 `src/grpc/handlers/` 中实现 gRPC 处理器
5. 在 `src/grpc/validators/` 中创建 gRPC 验证器（使用 class-validator）
6. 在 `swagger.json` 中更新 Swagger 文档
7. 添加相应的测试：
   - 单元测试在 `tests/specs/unit/`
   - 集成测试在 `tests/specs/integration/`
   - 验证器测试在 `tests/specs/validator/`
8. 服务使用快速的内存存储

## 开发工具

- **类型检查**：`pnpm run typecheck`
- **代码检查**：`pnpm run lint`
- **自动修复 lint 问题**：`pnpm run lint:fix`
- **格式检查**：`pnpm run format`
- **代码格式化**：`pnpm run format:fix`
- **完整质量检查**：`pnpm run check`（运行 typecheck、lint 和 format 检查）
- **自动修复所有问题**：`pnpm run fix`（运行 lint:fix 和 format:fix）

## Git 钩子

运行 `pnpm install` 时会自动配置 Git 钩子。它们确保在提交和推送前进行代码质量检查。

## 技术栈

- **运行时**：Node.js 22+（生产环境使用 Alpine Linux）
- **语言**：TypeScript
- **框架**：Express.js (REST)、gRPC
- **验证**：class-validator、express-openapi-validator
- **存储**：使用 JavaScript Map 的内存存储
- **云平台**：Google Cloud Platform (Cloud Run、Cloud Build)
- **测试**：Jest
- **代码质量**：ESLint、Prettier
- **包管理器**：pnpm
- **容器**：Docker（多阶段构建）

## 许可证

MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情
