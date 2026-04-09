# Storage DDL

## 说明

本文档给出 v1 阶段的数据库建表语句，目标数据库为 SQLite。

由于 SQLite 不支持 MySQL 那种原生列注释或 `COMMENT ON` 语法，所以下面的 DDL 使用 SQL 注释来描述表和字段含义。

## 设计目标

- 支持私有 Markdown 文档存储
- 支持每个文档绑定一个固定公开图片 UUID
- 支持图片删除、过期、重新生成
- 支持异步渲染任务队列
- 支持后续最小化扩展到多用户

## 枚举约定

本文档中的枚举值建议如下：

- `density_preset`
  - `ultra_sparse`
  - `sparse`
  - `standard`
  - `compact`
  - `ultra_compact`
- `expire_mode`
  - `never`
  - `at_datetime`
- `public_images.state`
  - `never_generated`
  - `rendering`
  - `active`
  - `deleted`
  - `expired`
  - `failed`
- `render_jobs.trigger_type`
  - `initial_generate`
  - `document_update`
  - `manual_regenerate`
  - `restore_after_delete`
  - `restore_after_expire`
- `render_jobs.status`
  - `pending`
  - `running`
  - `succeeded`
  - `failed`
  - `cancelled`

---

## 建表语句

```sql
PRAGMA foreign_keys = ON;

-- 用户表
-- 用于存储可以登录系统查看和编辑私有文档的账号。
CREATE TABLE IF NOT EXISTS users (
  -- 用户主键，建议使用 UUID。
  id TEXT PRIMARY KEY,

  -- 登录用户名，系统内唯一。
  username TEXT NOT NULL UNIQUE,

  -- 密码哈希，不保存明文密码。
  password_hash TEXT NOT NULL,

  -- 创建时间，使用 ISO 8601 字符串。
  created_at TEXT NOT NULL,

  -- 更新时间，使用 ISO 8601 字符串。
  updated_at TEXT NOT NULL
);


-- 文档表
-- 私有 Markdown 文档主表，是整个系统的核心对象。
CREATE TABLE IF NOT EXISTS documents (
  -- 文档主键，建议使用 UUID。
  id TEXT PRIMARY KEY,

  -- 文档所属用户 ID。
  owner_user_id TEXT NOT NULL,

  -- 文档标题，用于后台列表和管理，不要求等于 Markdown 一级标题。
  title TEXT NOT NULL,

  -- 原始 Markdown 内容。
  markdown_content TEXT NOT NULL,

  -- 阅读密度预设。
  density_preset TEXT NOT NULL,

  -- 过期模式：never / at_datetime。
  expire_mode TEXT NOT NULL,

  -- 公开图片过期时间，仅在 expire_mode = at_datetime 时生效。
  expire_at TEXT NULL,

  -- 最近一次渲染任务 ID，便于后台查询最新状态。
  latest_render_job_id TEXT NULL,

  -- 当前绑定的公开图片槽位 ID。
  current_public_image_id TEXT NOT NULL,

  -- 创建时间。
  created_at TEXT NOT NULL,

  -- 更新时间。
  updated_at TEXT NOT NULL,

  FOREIGN KEY (owner_user_id) REFERENCES users(id)
);


-- 公开图片表
-- 表示文档当前公开图片槽位；一个文档只绑定一条记录。
CREATE TABLE IF NOT EXISTS public_images (
  -- 公开图片槽位主键，建议使用 UUID。
  id TEXT PRIMARY KEY,

  -- 对应文档 ID；一份文档只能绑定一个公开图片槽位。
  document_id TEXT NOT NULL UNIQUE,

  -- 对外公开访问的固定 UUID。
  public_uuid TEXT NOT NULL UNIQUE,

  -- 当前状态：never_generated / rendering / active / deleted / expired / failed。
  state TEXT NOT NULL,

  -- 对象存储中的文件 key，例如 public-images/<uuid>.png。
  storage_key TEXT NULL,

  -- 当前图片 MIME 类型，例如 image/png。
  mime_type TEXT NULL,

  -- 当前图片字节大小。
  byte_size INTEGER NULL,

  -- 当前图片宽度。
  width INTEGER NULL,

  -- 当前图片高度。
  height INTEGER NULL,

  -- 最近一次成功渲染完成时间。
  last_rendered_at TEXT NULL,

  -- 删除时间；仅用于后台记录，不影响对外统一 404 语义。
  deleted_at TEXT NULL,

  -- 过期时间；仅用于后台记录，不影响对外统一 404 语义。
  expired_at TEXT NULL,

  -- 创建时间。
  created_at TEXT NOT NULL,

  -- 更新时间。
  updated_at TEXT NOT NULL,

  FOREIGN KEY (document_id) REFERENCES documents(id)
);


-- 渲染任务表
-- 用于驱动单进程异步渲染队列，并保存每次渲染时的输入快照。
CREATE TABLE IF NOT EXISTS render_jobs (
  -- 任务主键，建议使用 UUID。
  id TEXT PRIMARY KEY,

  -- 本次任务所属文档 ID。
  document_id TEXT NOT NULL,

  -- 本次任务操作的公开图片槽位 ID。
  public_image_id TEXT NOT NULL,

  -- 任务触发来源：initial_generate / document_update / manual_regenerate / restore_after_delete / restore_after_expire。
  trigger_type TEXT NOT NULL,

  -- 任务状态：pending / running / succeeded / failed / cancelled。
  status TEXT NOT NULL,

  -- 任务创建时的 Markdown 快照，防止排队期间文档内容变化导致结果不一致。
  snapshot_markdown TEXT NOT NULL,

  -- 任务创建时的阅读密度快照。
  snapshot_density TEXT NOT NULL,

  -- 任务创建时的过期时间快照。
  snapshot_expire_at TEXT NULL,

  -- 本次任务成功产出的对象存储 key。
  output_storage_key TEXT NULL,

  -- 失败信息，用于后台展示和重试排查。
  error_message TEXT NULL,

  -- 任务开始执行时间。
  started_at TEXT NULL,

  -- 任务结束时间。
  finished_at TEXT NULL,

  -- 创建时间。
  created_at TEXT NOT NULL,

  -- 更新时间。
  updated_at TEXT NOT NULL,

  FOREIGN KEY (document_id) REFERENCES documents(id),
  FOREIGN KEY (public_image_id) REFERENCES public_images(id)
);


-- 会话表
-- 用于基于 Session Cookie 的最小登录方案。
CREATE TABLE IF NOT EXISTS sessions (
  -- 会话主键，建议使用随机 UUID 或高熵 token。
  id TEXT PRIMARY KEY,

  -- 关联用户 ID。
  user_id TEXT NOT NULL,

  -- 会话过期时间。
  expires_at TEXT NOT NULL,

  -- 创建时间。
  created_at TEXT NOT NULL,

  -- 更新时间。
  updated_at TEXT NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 索引语句

```sql
-- 用户名唯一索引，便于登录查找。
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username
  ON users(username);

-- 文档按所属用户查询。
CREATE INDEX IF NOT EXISTS idx_documents_owner_user_id
  ON documents(owner_user_id);

-- 文档按更新时间排序，便于后台列表展示最近编辑内容。
CREATE INDEX IF NOT EXISTS idx_documents_updated_at
  ON documents(updated_at);

-- 公开图片按状态查询，便于后台筛选异常或待恢复数据。
CREATE INDEX IF NOT EXISTS idx_public_images_state
  ON public_images(state);

-- 公开访问根据 public_uuid 定位图片槽位。
CREATE UNIQUE INDEX IF NOT EXISTS idx_public_images_public_uuid
  ON public_images(public_uuid);

-- 渲染任务按文档查询。
CREATE INDEX IF NOT EXISTS idx_render_jobs_document_id
  ON render_jobs(document_id);

-- 渲染任务按公开图片槽位查询。
CREATE INDEX IF NOT EXISTS idx_render_jobs_public_image_id
  ON render_jobs(public_image_id);

-- 渲染任务按状态查询，便于队列轮询 pending/running 任务。
CREATE INDEX IF NOT EXISTS idx_render_jobs_status
  ON render_jobs(status);

-- 渲染任务按创建时间排序，便于 FIFO 队列消费。
CREATE INDEX IF NOT EXISTS idx_render_jobs_created_at
  ON render_jobs(created_at);

-- 会话按用户查询。
CREATE INDEX IF NOT EXISTS idx_sessions_user_id
  ON sessions(user_id);

-- 会话按过期时间清理。
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
  ON sessions(expires_at);
```

---

## 约束说明

### 一文一图

- `public_images.document_id` 为唯一约束，保证一个文档只绑定一个公开图片槽位。
- `public_images.public_uuid` 为唯一约束，保证公开 URL 唯一。

### 公开访问语义

- `public_images.state = active` 时，公开 URL 才应返回图片。
- `never_generated`、`deleted`、`expired`、`failed` 对外均应表现为 `404`。

### 渲染更新规则

- 渲染任务成功前，不应删除或清空旧的 `storage_key`。
- 只有在新任务成功后，才更新 `public_images` 的当前产物信息。
- 这样可以避免“先删旧图、后渲染失败”导致公开 URL 立即失效。

## 备注

- 当前 DDL 以 SQLite 为目标，时间字段统一使用 `TEXT` 存储 ISO 8601 时间字符串。
- 如未来迁移到 PostgreSQL，可保留同样的表结构语义，再替换为更严格的时间类型和枚举类型。
