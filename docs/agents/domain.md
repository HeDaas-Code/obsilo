---
title: obsilo Domain Docs 布局
type: agents-config
parent: AGENTS.md
---

# Domain Docs

**单上下文布局**——所有项目知识集中在两个位置：

## 根 `CONTEXT.md`

- 项目领域术语表
- 核心概念解释
- 自创词、缩写、命名冲突澄清
- 短（< 200 行）

## `docs/adr/`

Architecture Decision Records——记录**重大决策**（不是所有变更）：

- 数字编号（ADR-0001、ADR-0002...）
- 一次只一个决策（不混）
- 包含：背景 / 决策 / 后果 / 替代方案
- 决策不可撤销（只能 superseded by 新 ADR）

**何时开 ADR**：
- 引入新依赖
- 改变公共 API
- 重构跨 ≥3 个文件
- 推翻旧决策

**何时不开 ADR**：bug fix、文档更新、依赖升级（小版本）。

## `工作Wiki/`（不入仓）

agent 工作台——阶段产物、调研笔记、triage 草稿。

详见 [[工作Wiki/README]]。