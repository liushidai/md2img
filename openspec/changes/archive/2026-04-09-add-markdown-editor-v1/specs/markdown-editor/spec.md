## ADDED Requirements

### Requirement: Current document can be loaded for editing
系统 MUST 提供“当前文档”读取能力。页面首次进入时，系统 SHALL 返回一个可编辑文档对象；若数据库中尚无文档，系统 SHALL 返回空 Markdown 内容，而不是要求前端自行处理不存在语义。

#### Scenario: 页面首次加载已有文档
- **WHEN** 用户打开编辑页面且数据库中已经存在当前文档
- **THEN** 系统返回该文档的 Markdown 内容，并让前端据此完成编辑区回显与预览初始化

#### Scenario: 页面首次加载尚无文档
- **WHEN** 用户打开编辑页面且数据库中尚不存在当前文档
- **THEN** 系统返回一个内容为空的当前文档结果，使页面进入可编辑状态

### Requirement: Title is derived from the first non-empty level-one heading
系统 MUST 从 Markdown 首个非空一级标题推导页面标题，且 MUST NOT 额外要求用户单独输入标题。若 Markdown 不包含首个非空一级标题，页面 SHALL 显示“未命名文档”。

#### Scenario: 存在首个非空一级标题
- **WHEN** Markdown 的首个非空行是 `# 项目周报`
- **THEN** 页面标题显示为 `项目周报`

#### Scenario: 不存在首个非空一级标题
- **WHEN** Markdown 的首个非空行不是一级标题或内容为空
- **THEN** 页面标题显示为“未命名文档”

### Requirement: Preview is rendered locally and sanitized before display
系统 MUST 在前端本地将 Markdown 渲染为 HTML 预览，并在 HTML 插入页面前执行 sanitize。系统 MUST 允许原始 HTML 作为输入的一部分参与预览，但 MUST 移除脚本执行、事件属性、危险协议或其他高风险内容。

#### Scenario: 普通 Markdown 实时预览
- **WHEN** 用户在左侧编辑区输入 Markdown 内容
- **THEN** 右侧预览区实时显示对应的安全 HTML 结果，而无需等待后端响应

#### Scenario: 原始 HTML 含危险内容
- **WHEN** 用户输入包含 `script` 标签、内联事件或 `javascript:` 协议的原始 HTML
- **THEN** 预览区只显示经过 sanitize 的安全结果，且危险内容不会在页面中执行

### Requirement: Manual save persists Markdown source only
系统 MUST 采用手动保存策略，并且保存接口 MUST 只提交 Markdown 原文。保存成功后，后端 SHALL 将 Markdown 原文持久化到 SQLite，刷新页面后系统 SHALL 回显最近一次成功保存的内容。

#### Scenario: 用户手动保存当前内容
- **WHEN** 用户修改 Markdown 后点击保存按钮且请求成功
- **THEN** 系统持久化当前 Markdown 原文，并将页面状态更新为“已保存”

#### Scenario: 页面刷新后回显已保存内容
- **WHEN** 用户成功保存文档后刷新页面
- **THEN** 编辑区与预览区基于最近一次成功保存的 Markdown 内容重新初始化

### Requirement: Unsaved and saving states are explicit
系统 MUST 明确区分加载中、已保存、未保存、保存中与保存失败状态。未保存状态 MUST 由“当前内容是否不同于最近一次成功保存内容”决定；保存失败时系统 MUST 保留当前编辑内容并允许重试。

#### Scenario: 编辑后进入未保存状态
- **WHEN** 用户修改内容且当前 Markdown 与最近一次成功保存的 Markdown 不一致
- **THEN** 页面显示未保存状态，并启用保存按钮

#### Scenario: 内容恢复后回到已保存状态
- **WHEN** 用户将内容改回与最近一次成功保存的 Markdown 完全一致
- **THEN** 页面取消未保存状态，并禁用保存按钮

#### Scenario: 保存失败后继续编辑
- **WHEN** 用户点击保存但请求失败
- **THEN** 页面保留当前输入与预览结果，显示保存失败状态，并允许用户再次保存

### Requirement: Unsaved changes are protected on page exit
当页面存在未保存内容时，系统 MUST 在用户刷新、关闭或离开页面时触发浏览器原生未保存提醒；当页面不存在未保存内容时，系统 MUST NOT 触发该提醒。

#### Scenario: 存在未保存内容时离开页面
- **WHEN** 页面处于未保存状态且用户尝试刷新、关闭或离开当前页面
- **THEN** 浏览器触发原生未保存提醒

#### Scenario: 已保存状态下离开页面
- **WHEN** 页面不存在未保存内容且用户尝试刷新、关闭或离开当前页面
- **THEN** 系统不触发未保存提醒
