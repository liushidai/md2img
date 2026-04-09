## Why

当前仓库仍停留在前后端 health-check 骨架阶段，尚未形成任何真实业务闭环。需要先落地一个足够小但完整的第一版，让项目验证 Markdown 编辑、前端实时预览、后端持久化与页面回显这条主链路，并为后续图片生成能力提供稳定的文档源模型。

## What Changes

- 新增单文档 Markdown 编辑页面，采用左侧编辑、右侧预览的双栏布局。
- 新增当前文档读取与手动保存能力，使用 SQLite 持久化 Markdown 原文。
- 新增标题推导规则：页面标题从 Markdown 首个非空一级标题推导，不单独存储标题字段。
- 新增前端本地预览链路：Markdown 在浏览器本地解析为 HTML，并在渲染前执行 sanitize。
- 明确第一版不包含图片生成、公开 URL、渲染任务、历史版本、多文档管理与登录系统。

## Capabilities

### New Capabilities
- `markdown-editor`: 提供单文档 Markdown 编辑、HTML 安全预览、手动保存与刷新回显的产品行为与接口约束

### Modified Capabilities

无。

## Impact

- 前端：`apps/web` 需要新增 editor feature、页面状态管理与预览渲染逻辑。
- 后端：`apps/server` 需要新增 document 模块、SQLite 接入与读写接口。
- 共享层：`packages/shared` 需要新增文档读写协议与类型。
- 依赖：需要引入 SQLite 驱动、Markdown 解析库以及 HTML sanitize 能力。
- OpenSpec：新增 `markdown-editor` capability spec，用于约束页面行为、API 与持久化语义。
