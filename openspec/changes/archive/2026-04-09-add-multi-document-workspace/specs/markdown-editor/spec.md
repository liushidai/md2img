## MODIFIED Requirements

### Requirement: Current document can be loaded for editing
系统 MUST 提供按文档 ID 读取文档详情的能力。页面进入 `/documents/:id` 时，系统 SHALL 返回该文档的完整编辑对象；若请求的文档 ID 不存在，系统 SHALL 返回明确的不存在语义，而不是继续要求前端读取“当前文档”单例对象。

#### Scenario: 打开已存在的文档详情
- **WHEN** 用户访问某个已存在的 `/documents/:id`
- **THEN** 系统返回该文档的 `id`、`title`、`markdownContent` 与时间信息，并让前端据此初始化编辑区与预览区

#### Scenario: 打开不存在的文档详情
- **WHEN** 用户访问一个不存在的 `/documents/:id`
- **THEN** 系统返回文档不存在结果，前端据此展示对应错误或跳转逻辑

### Requirement: Title is derived from the first non-empty level-one heading
系统 MUST 为文档保存独立 `title` 元数据，并将其作为顶部栏与工作台列表的主要标题来源。正文中的首个非空一级标题 MAY 作为内容结构存在，但系统 MUST NOT 再要求页面标题只能从正文一级标题推导。

#### Scenario: 编辑独立标题而不修改正文 H1
- **WHEN** 用户修改文档 `title` 但不修改正文首个一级标题
- **THEN** 系统保存并展示新的独立标题，且不会强制改写正文内容

#### Scenario: 正文没有一级标题
- **WHEN** 文档正文不包含首个非空一级标题
- **THEN** 系统仍可依赖独立 `title` 正常展示文档名称

### Requirement: Manual save persists Markdown source only
系统 MUST 采用手动保存策略，并且保存接口 MUST 以文档 ID 为目标，同时提交当前文档的 `title` 与 Markdown 原文。保存成功后，后端 SHALL 持久化该文档的标题与正文，刷新或重新进入对应 URL 后系统 SHALL 回显最近一次成功保存的内容。

#### Scenario: 手动保存指定文档
- **WHEN** 用户在某个 `/documents/:id` 页面修改标题或 Markdown 后点击保存按钮且请求成功
- **THEN** 系统持久化该文档当前的 `title` 与 Markdown 原文，并将页面状态更新为“已保存”

#### Scenario: 重新进入已保存文档
- **WHEN** 用户成功保存某篇文档后重新进入对应 `/documents/:id`
- **THEN** 编辑区与预览区基于该文档最近一次成功保存的数据重新初始化

### Requirement: Unsaved and saving states are explicit
系统 MUST 明确区分加载中、已保存、未保存、保存中与保存失败状态。未保存状态 MUST 由“当前文档的 `title` 或 Markdown 是否不同于最近一次成功保存内容”决定；保存失败时系统 MUST 保留当前编辑内容并允许重试。

#### Scenario: 编辑标题后进入未保存状态
- **WHEN** 用户只修改当前文档标题，且该标题不同于最近一次成功保存值
- **THEN** 页面显示未保存状态，并启用保存按钮

#### Scenario: 编辑正文后进入未保存状态
- **WHEN** 用户修改当前文档 Markdown，且其内容不同于最近一次成功保存值
- **THEN** 页面显示未保存状态，并启用保存按钮

#### Scenario: 保存失败后继续编辑
- **WHEN** 用户点击保存但请求失败
- **THEN** 页面保留当前标题、输入与预览结果，显示保存失败状态，并允许用户再次保存

### Requirement: Unsaved changes are protected on page exit
当页面存在未保存内容时，系统 MUST 在用户刷新、关闭、离开页面或切换到另一篇文档时进行保护；当页面不存在未保存内容时，系统 MUST NOT 触发额外保护。

#### Scenario: 浏览器离开页面时存在未保存内容
- **WHEN** 页面处于未保存状态且用户尝试刷新、关闭或离开当前页面
- **THEN** 浏览器触发原生未保存提醒

#### Scenario: 切换到另一篇文档时存在未保存内容
- **WHEN** 页面处于未保存状态且用户尝试切换到另一篇文档
- **THEN** 系统先进行确认，再决定是否切换
