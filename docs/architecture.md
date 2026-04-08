# Architecture

## 总体结构
本项目采用 Monorepo 结构：

- apps/server：后端服务
- apps/web：前端应用
- packages/shared：共享类型与协议

## 分层职责
### server
负责：
- 提供 API
- 业务逻辑
- 数据处理

### web
负责：
- 页面展示
- 用户交互
- 调用 API

### shared
负责：
- 共享类型
- 共享 schema
- 共享常量

## 数据流
用户输入 -> web/features/<feature>/api.ts -> server/modules/<feature>/route -> service -> 返回结果 -> 前端展示