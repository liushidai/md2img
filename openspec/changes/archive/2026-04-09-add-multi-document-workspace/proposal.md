## Why

当前系统已经具备单文档编辑、预览、保存与回显闭环，但仍停留在“实验页”阶段，无法支撑真实写作后台场景。需要把单文档模型升级为多文档工作台，让用户能够创建、切换和管理多份 Markdown 文档，并为后续图片生成与登录体系建立更稳定的文档资源模型。

## What Changes

- 新增多文档工作台，提供文档列表、新建文档、按文档切换与按文档保存能力。
- 新增基于文档 ID 的路由语义，由前端根据 URL 维护当前选中文档，而不是由后端提供 `current` 单例语义。
- 新增独立 `title` 字段作为文档元数据，用于列表展示、顶部标题与文档身份识别，不再要求标题只能从 Markdown 一级标题推导。
- **BREAKING** 将后端接口从 `/api/documents/current` 升级为资源型文档接口，支持列表、创建、按 ID 读取与按 ID 更新。
- 更新未保存保护规则，使其同时覆盖浏览器离开与文档切换场景。
- 明确本次变更仍不包含删除、搜索、自动保存、历史版本、图片生成与登录系统。

## Capabilities

### New Capabilities
- `document-workspace`: 提供多文档列表、新建、按 URL 选中当前文档、按文档保存与工作台交互规则

### Modified Capabilities
- `markdown-editor`: 将单文档 `current` 读取/保存语义升级为资源型文档详情编辑，并将标题规则从“正文首个一级标题推导”修改为“独立 title 元数据”

## Impact

- 前端：`apps/web` 需要新增工作台壳层、文档列表、基于路由的当前文档加载逻辑与切换保护。
- 后端：`apps/server` 需要把单文档接口重构为多文档资源接口，并升级 SQLite `documents` 表结构。
- 共享层：`packages/shared` 需要新增文档列表、文档详情、创建与更新协议。
- OpenSpec：需要新增 `document-workspace` capability，并修改现有 `markdown-editor` capability 以消除 `current` 与标题推导的单文档假设。
