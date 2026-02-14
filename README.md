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

## 环境变量

复制 `.env.example` 到 `.env.local` 并按需填写。

```bash
cp .env.example .env.local
```

- 若不填写 API Key，系统将自动使用本地降级逻辑（mock）运行。
- 若填写并开启 `USE_REAL_LLM/USE_REAL_SEARCH`，将走真实服务调用。
- 若配置 `DATABASE_URL` 且 `USE_PRISMA_STORAGE=true`，后端将使用 PostgreSQL 持久化存储。
