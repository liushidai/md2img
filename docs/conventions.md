# Conventions

## 文件命名
- 路由：xxx.route.ts
- 服务：xxx.service.ts
- 类型：xxx.schema.ts 或 shared/types/xxx.ts
- 前端 API：features/<feature>/api.ts

## 命名规则
- 组件名使用 PascalCase
- 函数名使用 camelCase
- 类型名使用 PascalCase
- 常量使用 UPPER_SNAKE_CASE

## 代码规则
- 一个文件只处理一个主要职责
- 不要把 API 请求写在页面组件里
- 不要重复定义共享类型
- 不要写超大 utils.ts