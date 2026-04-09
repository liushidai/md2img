## ADDED Requirements

### Requirement: The workspace can list documents
系统 MUST 提供文档列表能力，用于在工作台左侧展示可切换文档。列表项 SHALL 至少包含文档 `id`、`title`、`createdAt` 与 `updatedAt`，并按最近更新时间倒序返回。

#### Scenario: 页面加载文档列表
- **WHEN** 用户进入多文档工作台
- **THEN** 系统返回文档列表，并按 `updatedAt` 从新到旧排序

### Requirement: Users can create a new document and navigate to it
系统 MUST 允许用户创建新文档。创建成功后，系统 SHALL 返回真实文档 ID，前端 SHALL 跳转到该文档对应的 URL，并将其作为当前选中文档。

#### Scenario: 创建首篇或新的一篇文档
- **WHEN** 用户点击“新建文档”且创建请求成功
- **THEN** 系统创建真实文档记录，并让前端跳转到新文档 URL

### Requirement: Current document selection is determined by URL
系统 MUST 使用文档 ID 路由来标识当前选中文档。前端 SHALL 依据 `/documents/:id` 加载当前文档详情，后端 MUST NOT 再要求客户端通过 `current` 单例语义读取当前文档。

#### Scenario: 通过 URL 打开指定文档
- **WHEN** 用户访问 `/documents/:id`
- **THEN** 前端按该 `id` 读取对应文档详情并显示在编辑区

### Requirement: Unsaved changes are protected when switching documents
当当前文档存在未保存修改时，系统 MUST 在用户切换到另一篇文档前进行确认。若用户取消切换，系统 SHALL 保持当前文档不变；若用户确认放弃修改，系统 SHALL 切换到目标文档。

#### Scenario: 未保存状态下切换文档
- **WHEN** 当前文档存在未保存修改且用户点击另一篇文档
- **THEN** 系统先提示确认，而不是直接切换

#### Scenario: 用户取消切换
- **WHEN** 系统提示确认后用户选择继续留在当前文档
- **THEN** 当前文档与其编辑状态保持不变

### Requirement: New documents use independent title metadata
系统 MUST 为每份文档保存独立 `title` 元数据，并将其用于列表展示与工作台顶部显示。该标题 MAY 与正文中的一级标题不同，系统 MUST NOT 再把正文首个 H1 视为唯一标题来源。

#### Scenario: 文档列表显示独立标题
- **WHEN** 文档存在独立 `title`
- **THEN** 工作台列表与顶部标题显示该 `title`，而不是强制使用正文首个 H1
