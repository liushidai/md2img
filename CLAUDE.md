# AI Rules（执行规则）

## 基础

* 使用 Bun，不使用 Node.js 生态工具
* 使用 `bun run`、`bun install`、`bunx`
* 不使用 dotenv（Bun 自动加载 .env）

---

## 必须遵守

* 所有共享类型必须来自 `packages/shared`
* 不允许重复定义类型
* 后端代码放在 `apps/server/src/modules/<feature>`
* 前端代码放在 `apps/web/src/features/<feature>`
* API 请求必须放在 `features/<feature>/api.ts`
* 不要在组件中写复杂业务逻辑

---

## 禁止

* 不要使用 React（本项目使用 Vue）
* 不要使用 Bun 的 HTML bundler（使用 Vite）
* 不要引入不必要的新库
* 不要写超大文件或万能 utils

---

## 修改代码时

1. 优先复用已有模块
2. 遵循当前目录结构
3. 使用 shared 类型
4. 保持修改最小化（不要大规模重构）

---


