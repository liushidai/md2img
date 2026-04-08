# AI Context

## 项目简介
这是一个 Monorepo 项目。

- 后端：Bun + Elysia
- 前端：Vue 3 + Vite + Pinia
- 包管理：Bun workspace
- 共享层：packages/shared

## 目录结构
- apps/server：后端 API
- apps/web：前端应用
- packages/shared：前后端共享类型、schema、常量
- docs：项目文档

## 开发原则
- 所有前后端共享类型必须放在 packages/shared
- 不要在前端和后端重复定义同一类型
- 后端按 modules/<feature> 组织
- 前端按 features/<feature> 组织
- 一个文件只做一件事
- 优先显式导入导出
- 避免魔法代码和隐式注册

## 后端结构
每个模块建议包含：
- route
- service
- schema

例如：
apps/server/src/modules/render/

## 前端结构
每个功能建议包含：
- api
- components
- composables

例如：
apps/web/src/features/render/

## API 规则
- 组件中不要直接写复杂 fetch 逻辑
- API 请求统一放到 features/<feature>/api.ts
- 请求和响应类型优先使用 shared

## 常用命令
- bun run dev
- bun run dev:web
- bun run dev:server

## 当前阶段
- 已完成：基础架构、health 接口打通
