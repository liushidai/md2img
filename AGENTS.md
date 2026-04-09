# AGENTS

## 先看这里
- 这是 Bun workspaces 单仓库；用 `bun install`、`bun run`、`bunx`，不要改成 npm/pnpm/node 流程。
- 根目录 `README.md` 里的 `bun run index.ts` 已过时；当前真实入口是 `apps/server/src/index.ts` 和 `apps/web/src/main.ts`。
- Bun 会自动加载 `.env`，不要再引入 `dotenv`。

## 目录与边界
- 前端在 `apps/web`，使用 Vue 3 + Vite + Pinia；不要引入 React。
- 后端在 `apps/server`，使用 Elysia；模块放在 `apps/server/src/modules/<feature>`。
- 共享类型统一放 `packages/shared/src`，通过 `@md2img/shared` 引用；不要在应用内重复定义同一类型。
- 前端功能代码放 `apps/web/src/features/<feature>`；该功能的 API 请求放 `features/<feature>/api.ts`。
- 不要把复杂业务逻辑塞进 Vue 组件；优先放到 feature 层或已有模块。

## 常用命令
- 安装依赖：`bun install`
- 同时启动前后端：`bun run dev`
- 只启动前端：`bun run dev:web`
- 只启动后端：`bun run dev:server`
- 前端类型检查：`bun run typecheck:web`
- 前端构建：`bun run build:web`
- 若只想在前端包内执行校验：在 `apps/web` 下运行 `bun run lint`、`bun run type-check`、`bun run build`

## 校验与已知事实
- 根目录没有统一的 lint/test 脚本；前端校验以 `apps/web` 脚本为准。
- `apps/server/package.json` 只有 `dev`，`test` 仍是占位脚本，不要假设后端已有测试体系。
- 前端 lint 会顺序执行 `oxlint --fix` 和 `eslint --fix --cache`；格式化使用 Prettier，配置在 `apps/web/.prettierrc.json`（无分号、单引号、`printWidth: 100`）。

## 环境与联调
- 前端开发环境通过 `apps/web/.env.development` 提供 `VITE_API_BASE_URL=http://localhost:3000`。
- 后端默认监听 `3000`，并只在代码里放行 `http://localhost:5173` 的 CORS；本地联调默认前端端口就是 `5173`。

## 修改代码时
- 优先复用现有模块，保持改动最小；不要顺手做大重构。
- 不要引入不必要的新库，不要新增超大文件或“万能 utils”。
- 代码注释与仓库文档统一使用中文。
- 以上约束同时来自仓库现有 `CLAUDE.md`，如有冲突，先遵守这里能被当前代码与配置验证的部分。
