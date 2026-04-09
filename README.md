# md2img

## 项目简介

md2img 用于把私有 Markdown 文档维护为可持续更新的内容源，并面向后续“固定公开图片 URL 发布”的产品目标演进。

当前仓库已经实现一套可本地运行的基础版本：

- 前端提供 Markdown 编辑与预览页面
- 后端提供当前文档的读取与保存接口
- 文档内容持久化到本地 SQLite
- 前后端共享类型定义，便于联调与演进

## 当前已实现能力

- 加载当前文档
- 编辑 Markdown 内容
- 手动保存文档
- 实时 HTML 预览
- 显示保存状态与错误提示
- 页面关闭前未保存提醒

## 技术栈

### 前端

- Vue 3
- Vite
- Pinia

### 后端

- Elysia
- Bun
- bun:sqlite

### 共享层

- `packages/shared` 提供共享类型

## 仓库结构

```text
.
├── apps/
│   ├── server/   # 后端服务
│   └── web/      # 前端应用
├── packages/
│   └── shared/   # 共享类型与协议
└── docs/         # 产品与架构文档
```

### 关键入口

- 后端入口：`apps/server/src/index.ts`
- 前端入口：`apps/web/src/main.ts`
- 共享类型入口：`packages/shared/src/index.ts`

## 快速开始

### 1. 安装依赖

```bash
bun install
```

### 2. 配置环境变量

前端开发环境使用 `apps/web/.env.development`：

```bash
VITE_API_BASE_URL=http://localhost:3000
```

### 3. 启动开发环境

同时启动前后端：

```bash
bun run dev
```

启动后默认访问地址：

- 前端：`http://localhost:5173`
- 后端：`http://localhost:3000`

也可以分别启动：

```bash
bun run dev:web
bun run dev:server
```

## 常用命令

### 根目录

```bash
# 同时启动前后端
bun run dev

# 仅启动前端
bun run dev:web

# 仅启动后端
bun run dev:server

# 构建前后端
bun run build

# 前端类型检查
bun run typecheck:web

# 后端类型检查
bun run typecheck:server

# 前端检查（类型检查 + lint）
bun run check:web
```

### 前端目录 `apps/web`

```bash
bun run dev
bun run build
bun run type-check
bun run lint
bun run format
```

### 后端目录 `apps/server`

```bash
bun run dev
```

## 数据与接口

### 当前数据存储

- 文档数据保存在后端工作目录下的 `documents.sqlite`
- 当前只维护一份“当前文档”

### 当前接口

#### 获取当前文档

```http
GET /api/documents/current
```

#### 保存当前文档

```http
PUT /api/documents/current
Content-Type: application/json

{
  "markdownContent": "# Hello"
}
```

#### 健康检查

```http
GET /api/health/
```

### 当前共享类型

`packages/shared` 当前主要定义：

- `HealthResponse`
- `CurrentDocument`
- `GetCurrentDocumentResponse`
- `UpdateCurrentDocumentRequest`
- `UpdateCurrentDocumentResponse`

## 开发说明

- 本项目是 **Bun workspaces** 单仓库，统一使用 `bun install`、`bun run`、`bunx`
- 前端通过 `VITE_API_BASE_URL` 连接后端
- 后端默认监听 `3000`
- 后端开发环境已放行本地前端端口的 CORS
- 当前后端测试脚本仍是占位状态，不要假设已有完整测试体系

## 产品方向

本项目的目标并不是一次性导出图片文件，而是：

- 让用户持续维护私有 Markdown 文档
- 将文档渲染结果发布到固定的公开图片 URL
- 在内容更新后保持外链地址不变

当前仓库实现的是该方向上的第一阶段基础能力：文档编辑、保存、预览与数据持久化。

## 相关文档

- 产品说明：`docs/product.md`
- 架构说明：`docs/architecture.md`
