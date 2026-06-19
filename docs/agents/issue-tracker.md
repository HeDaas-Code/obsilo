---
title: obsilo Issue Tracker 配置
type: agents-config
parent: AGENTS.md
---

# Issue Tracker

项目使用 GitHub Issues。

- 仓库：`HeDaas-Code/obsilo`
- 模板：复用 fork 上游默认模板（暂未自定义）
- 关联到 PR：`#<num>` 引用
- 关闭：commit message 写 `Closes #<num>` / `Fixes #<num>`

## 工作流

1. 新需求 → 开 issue（中文标题）
2. 复杂任务 → 转 PR → 用 `feat:` / `fix:` 前缀
3. triage 时打标签（见 [[triage-labels]]）
4. 实现完成后关闭 issue