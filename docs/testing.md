# 测试指引

## 目的

本文档用于统一 `md2img` 项目的测试策略、测试范围、目录约定与提交流程，适用于 AI 生成代码、人工开发与代码评审。

本项目当前为 Bun workspaces 单仓库：

- `apps/server`：后端，Elysia + Bun
- `apps/web`：前端，Vue 3 + Vite + Pinia
- `packages/shared`：共享类型与协议

## 当前仓库现状

截至当前版本，仓库已有构建与类型检查能力，但测试体系仍未完整落地：

- 根目录无统一 `test` 脚本
- `apps/web` 暂无 `vitest` 脚本与配置
- `apps/server` 的 `test` 仍为占位脚本
- 仓库中暂无正式测试文件

因此，本文档既是测试规范，也是后续补齐测试能力时的落地依据。

## 测试目标

### 覆盖率目标

| 范围 | 目标 |
| --- | --- |
| 全项目平均覆盖率 | ≥ 70% |
| 核心模块 | ≥ 80% |
| 新增代码 | ≥ 80% |

### 优先级

覆盖率不是第一目标，业务风险才是第一目标。必须优先覆盖以下内容：

- 鉴权、登录、权限控制
- 数据创建、更新、删除
- API 错误处理与状态码
- 第三方调用失败后的兜底逻辑
- 边界条件：`null`、空字符串、空数组、缺失参数、极值
- 历史出现过缺陷、且近期仍在变更的模块

## 测试分层

### 1. 后端测试

后端优先使用 Bun 原生测试能力，直接通过 `app.handle()` 调用 Elysia 应用，而不是优先走完整网络链路。

建议重点覆盖：

- 路由返回值
- 参数校验
- schema 校验
- middleware / plugin 行为
- 错误分支与状态码
- service 层业务逻辑

推荐示例：

```ts
import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'

const app = new Elysia().get('/', () => 'ok')

describe('GET /', () => {
  it('应返回 ok', async () => {
    const response = await app.handle(new Request('http://localhost/'))

    expect(await response.text()).toBe('ok')
  })
})
```

### 2. 前端测试

前端建议使用 Vitest + `@vue/test-utils`，优先覆盖组件行为与 feature 层逻辑，不要把复杂业务断言堆在页面快照里。

建议重点覆盖：

- props 渲染
- 用户交互：`click`、`input`、表单提交
- 条件渲染：`v-if`、`v-show`
- 加载中、成功、失败三种状态
- Pinia store 的状态变更
- `features/<feature>/api.ts` 的请求封装与错误映射

推荐示例：

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import HelloWorld from './HelloWorld.vue'

describe('HelloWorld.vue', () => {
  it('应正确渲染文本', () => {
    const wrapper = mount(HelloWorld)

    expect(wrapper.text()).toContain('Hello')
  })
})
```

### 3. 集成测试

关键流程必须补充集成测试，优先覆盖：

- 前后端接口联动
- 登录或身份识别流程
- 提交与生成流程
- 接口失败后的前端兜底提示
- 共享类型或 schema 变更后的兼容性

如果某个能力涉及 `apps/web`、`apps/server` 与 `packages/shared` 同时变化，应至少有一条覆盖主链路的集成测试。

## 项目目录约定

### 后端

后端模块位于 `apps/server/src/modules/<feature>`，测试建议按功能就近组织，或集中放在 `apps/server/tests`。

推荐两种方式，二选一并保持一致：

```bash
apps/server/
  src/
    modules/
      render/
        render.route.ts
        render.service.ts
        render.test.ts
```

或：

```bash
apps/server/
  src/
    modules/
      render/
        render.route.ts
        render.service.ts
  tests/
    render.test.ts
```

### 前端

前端功能代码位于 `apps/web/src/features/<feature>`，推荐测试与功能靠近，便于随功能一起维护。

```bash
apps/web/
  src/
    features/
      editor/
        api.ts
        store.ts
        components/
          EditorPanel.vue
          EditorPanel.test.ts
        api.test.ts
        store.test.ts
```

### 共享包

`packages/shared` 只放共享类型、schema、常量。原则上不为纯类型文件补测试，但以下情况需要测试：

- 含运行时代码
- 含 schema 校验逻辑
- 含跨端约束或转换逻辑

## 编写规则

### 必须遵守

- 每个新增功能或修复都应附带对应测试
- 至少覆盖正常路径、异常路径、边界条件
- 断言必须体现业务结果，不要只断言“代码执行过”
- 不要 mock 业务核心逻辑本身
- 可以 mock 网络、时间、随机数、浏览器 API、外部服务
- 测试名称使用中文，直接描述业务行为

### 推荐实践

- 一个测试只验证一个主要行为
- 优先验证输入与输出，而不是内部实现细节
- 组件测试优先断言用户可见结果
- service 测试优先断言返回值、错误、状态变更
- 修复 bug 时，先补一个能复现问题的测试，再改实现

### 不推荐

- 只测 happy path
- 没有断言或断言过弱
- 为了提高覆盖率测试无业务价值的分支
- 大量依赖快照代替关键断言
- 对重构极度敏感的实现细节做断言

## Mock 原则

### 可以 mock

- 第三方 HTTP 请求
- 浏览器环境能力
- 时间、随机数、文件系统边界
- 很慢或不稳定的外部依赖

### 不要 mock

- 当前要验证的核心业务逻辑
- 关键数据转换规则
- 权限判断核心分支
- 关键错误处理逻辑

原则：mock 边界，不 mock 业务真相。

## AI 生成测试流程

标准流程：

```text
写功能 / 改缺陷
→ 生成或补齐测试
→ 人工审核测试是否覆盖关键风险
→ 运行校验
→ 合并
```

推荐提示词模板：

```text
为以下代码生成测试，要求：

1. 后端使用 bun test，前端使用 vitest
2. 覆盖正常路径、异常路径与边界条件
3. 不要 mock 核心业务逻辑
4. 输出完整可运行代码
5. 测试名称使用中文
```

AI 生成测试时，必须人工重点检查以下问题：

- 是否只覆盖 happy path
- 是否遗漏错误分支
- 是否把核心逻辑 mock 掉了
- 是否有断言但没有业务意义
- 是否与当前项目目录结构、命名约定不一致

## 执行建议

### 当前可执行校验

仓库当前可直接执行的校验命令：

```bash
bun run typecheck:web
bun run typecheck:server
bun run lint:web
bun run check:web
bun run check:server
```

### 测试脚本落地建议

在测试体系补齐后，建议统一为以下命令风格：

```bash
# 后端
bun run --cwd apps/server test
bun run --cwd apps/server test --coverage

# 前端
bun run --cwd apps/web test
bun run --cwd apps/web test:coverage
```

根目录后续建议补充聚合脚本：

```bash
bun run test
bun run test:web
bun run test:server
bun run test:coverage
```

## PR 要求

每个 PR 应满足：

- 包含与改动对应的测试，或明确说明暂未补测的原因
- 新增逻辑有测试覆盖
- 所有相关校验通过
- 不降低关键模块覆盖质量

以下情况不应合并：

- 没有测试且无法说明原因
- 只有 happy path，没有异常路径
- 修复高风险问题但没有回归测试
- 覆盖率数字上升，但关键路径仍未被验证

## 哪些内容可降低优先级

以下内容通常不必优先补测试：

- 纯类型定义
- 简单常量文件
- 无逻辑的 DTO 映射
- 纯样式调整

但如果这些文件承载运行时逻辑、约束校验或跨端协议，就应纳入测试范围。

## 落地顺序建议

本项目建议按以下顺序补齐测试体系：

1. 先为 `apps/server` 建立可运行的 Bun 测试脚本
2. 为 `apps/web` 引入 Vitest 与基础配置
3. 先覆盖高风险 feature，而不是追求全量铺开
4. 再补充覆盖率统计与 CI 门禁

优先从以下模块开始：

- 用户输入校验
- 核心 API 路由
- 前端提交与结果展示流程
- 错误提示与失败兜底

## 总结

本项目测试的核心原则是：

- 先测高风险业务，再看覆盖率
- 后端优先用 Bun 原生测试
- 前端优先用 Vitest 做行为测试
- 共享层只测试运行时逻辑，不为纯类型刷覆盖率
- AI 可以生成测试，但不能替代人工判断测试质量
