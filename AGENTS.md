---
title: obsilo Agent Skills Configuration
type: agents-config
status: active
last_updated: 2026-06-19
---

# AGENTS.md — obsilo Agent Skills Configuration

> 本文件配置 obsilo 项目使用 Hermes / Matt Pocock engineering skills 所需的项目级上下文。

## Agent skills

### Issue tracker

项目使用 GitHub Issues 追踪工作。详见 [[docs/agents/issue-tracker]]。

### Triage labels

使用 Matt Pocock 默认 5 类状态机标签（无需自定义）。详见 [[docs/agents/triage-labels]]。

### Domain docs

单上下文布局——根 `CONTEXT.md` + `docs/adr/`。详见 [[docs/agents/domain]]。

## 沟通约定

- **本项目代码、注释、issue/PR 标题使用中文**
- **变量/函数命名使用英文**（TypeScript 业界惯例）
- **Commit message**：`feat: <中文简述>` / `fix: <中文简述>` / `chore: <中文简述>` / `docs: <中文简述>`
- **分支命名**：`feature/<功能>` / `fix/<问题>` / `chore/<任务>`

## 快速命令

```bash
# 开发模式（esbuild watch + 实时拷贝到 vault）
npm run dev

# 生产构建
npm run build

# 测试
npm test

# Lint
npm run lint

# 文档（vitepress）
npm run docs:dev
```

## 关联笔记

- [[README]] — 仓库根 README（项目门面）
- [[ARCHITECTURE]] — 架构参考（嵌入插件，给 agent 自身修改用）
- [[工作Wiki/README]] — 工作 Wiki 入口
- [[工作Wiki/00-index/README]] — 项目速览
- [[CONTEXT]] — 项目领域术语