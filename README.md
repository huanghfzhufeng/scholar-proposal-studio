# scholar-proposal-studio

面向科研人员的国自然申请书 AI 全流程平台，覆盖智能访谈、候选大纲生成、学术检索、全文生成、在线编辑与 Word/PDF 导出。

## 当前能力

- 多页面前端 Demo（访谈、大纲、资料库、生成、编辑导出、水库恢复）
- 4 个业务智能体目录化实现（interview / outline / retrieval / draft）
- API 路由骨架与流程编排器
- 软删除归档恢复
- 生成前引用数量校验（每个一级章节 >= 2 条）

## 运行方式

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## 测试

```bash
npm run test
```

## Docker 启动

1. 可选：在项目根目录创建 `.env`（用于覆盖默认参数）

```bash
cat > .env <<'EOF'
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=scholar_proposal_studio
USE_REAL_LLM=false
MINIMAX_API_KEY=
USE_REAL_SEARCH=false
TAVILY_API_KEY=
EOF
```

2. 构建并启动

```bash
docker compose up --build -d
```

3. 访问系统

- 应用：[http://localhost:3000](http://localhost:3000)
- 数据库：`localhost:5432`

4. 停止服务

```bash
docker compose down
```

5. 如需清空数据库卷（危险操作）

```bash
docker compose down -v
```

## 环境变量

复制 `.env.example` 到 `.env.local` 并按需填写。

```bash
cp .env.example .env.local
```

- 若不填写 API Key，系统将自动使用本地降级逻辑（mock）运行。
- 若填写并开启 `USE_REAL_LLM/USE_REAL_SEARCH`，将走真实服务调用。
- 若配置 `DATABASE_URL` 且 `USE_PRISMA_STORAGE=true`，后端将使用 PostgreSQL 持久化存储。
