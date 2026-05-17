---
title: 保险库操作
description: 了解 Obsilo 如何读取、写入、搜索和组织您的保险库。
---

# 保险库操作

Obsilo 可以跨整个保险库读取、写入、搜索和组织文件。

## 工作原理

Agent 不会直接访问您的保险库。它使用工具：小型单一用途的函数。当您要求 Agent 查找笔记或创建文件时，它会选择合适的工具并代表您调用它们。

每次工具调用都会显示在[活动块](/guides/chat-interface#activity-blocks)中，写入操作需要[批准](/guides/safety-control)，除非您启用了自动批准。

## 读取保险库

这些工具让 Agent 可以查看您的文件而不做任何更改。在"提问"和"Agent"模式下均可用。

| 工具 | 功能 |
|------|------|
| **read_file** | 打开笔记并读取其内容 |
| **list_files** | 列出给定路径下的文件和文件夹 |
| **search_files** | 通过文本内容查找笔记（关键词搜索） |
| **search_by_tag** | 查找带有特定标签的所有笔记 |
| **get_frontmatter** | 读取笔记顶部的 YAML 元数据 |
| **get_linked_notes** | 跟踪笔记中的维基链接和反向链接 |
| **get_daily_note** | 打开今天的日记（或指定日期） |

### 示例

- *"我在 Projects 文件夹里有哪些笔记？"*（使用 `list_files`）
- *"查找我写的所有关于客户入职的内容"*（使用 `search_files`）
- *"显示所有带有 #review 标签的笔记"*（使用 `search_by_tag`）
- *"哪些笔记链接到我的季度目标笔记？"*（使用 `get_linked_notes`）
- *"阅读今天的日记"*（使用 `get_daily_note`）

:::tip 语义搜索更进一步
关键词搜索匹配精确词汇。按含义查找笔记（例如，"关于改善睡眠的笔记"能找到一个标题为"晚间习惯"的笔记），请参阅[知识发现](/guides/knowledge-discovery)。
:::

## 写入和编辑

这些工具会修改您的保险库。仅在 Agent 模式下可用，默认需要批准。

| 工具 | 功能 |
|------|------|
| **write_file** | 创建新笔记或替换现有笔记 |
| **edit_file** | 对笔记的某部分进行定向修改 |
| **append_to_file** | 将内容添加到现有笔记的末尾 |
| **update_frontmatter** | 修改 YAML 元数据字段 |

### 示例

- *"创建一条总结 Q1 业绩的笔记"*（使用 `write_file`）
- *"用较短版本替换 @project-brief 中的第二段"*（使用 `edit_file`）
- *"将今天的待办事项添加到 @task-list"*（使用 `append_to_file`）
- *"将 @project-brief 中的状态字段设置为'已完成'*（使用 `update_frontmatter`）

:::info 检查点保护您的文件
在任何写入操作之前，Obsilo 都会保存快照。如果出现问题，点击[撤销栏](/guides/chat-interface#the-undo-bar)中的"撤销"来恢复原始文件。
:::

## 整理文件和文件夹

这些工具帮助您重组保险库结构。

| 工具 | 功能 |
|------|------|
| **create_folder** | 创建新文件夹（包括嵌套路径） |
| **move_file** | 将笔记移动到其他文件夹或重命名 |
| **delete_file** | 将笔记发送到 Obsidian 垃圾箱 |

### 示例

- *"创建 Archive/2025 文件夹并将所有带有 #archived 标签的笔记移至此处"*（使用 `create_folder` + `move_file`）
- *"将 @old-project-name 重命名为 new-project-name"*（使用 `move_file`）
- *"删除 Inbox 文件夹中的所有空笔记"*（使用 `delete_file`）

:::warning 删除使用 Obsidian 垃圾箱
删除的文件会进入 Obsidian 的垃圾箱（`.trash` 文件夹），而不是永久删除。您可以从那里恢复它们。
:::

## 保险库统计

Agent 可以使用 **get_vault_stats** 为您提供保险库概览：

- 笔记、文件夹和附件的总数
- 保险库大小
- 标签分布
- 最近修改的文件

**示例：** *"给我一个保险库摘要：有多少笔记，使用最多的标签是什么？"*

## Canvas 和可视化图

Obsilo 可以创建笔记及其关系的可视化表示。

| 工具 | 功能 |
|------|------|
| **generate_canvas** | 创建 Obsidian Canvas（.canvas）文件，包含卡片和连接 |
| **create_excalidraw** | 创建 Excalidraw 绘图（需要 Excalidraw 插件） |

**示例：** *"创建一张 Canvas 图，显示 Projects 文件夹中的所有笔记及其连接关系"*

## Bases（结构化数据）

Bases 让您将笔记作为结构化数据来操作，类似于数据库视图。

| 工具 | 功能 |
|------|------|
| **create_base** | 从符合特定条件的笔记创建新 Base |
| **query_base** | 使用过滤器和排序查询现有 Base |
| **update_base** | 修改 Base 中的条目 |

**示例：** *"创建一个包含所有带有 #book 标签的笔记的 Base，列为 frontmatter 中的作者、评分和状态"*

:::info 需要 Obsidian 1.8+
Bases 使用 Obsidian 内置的 Bases 功能。请确保您的 Obsidian 版本支持此功能。
:::

## 技巧

1. 路径要具体。"Projects 文件夹"比"我的项目笔记"更清晰。
2. 使用 @-mentions 引用特定文件。Agent 不必搜索它们。
3. 让 Agent 链接工具。像"找出所有关于 X 的笔记，总结它们，并创建一条包含摘要的新笔记"这样的请求会自动使用多个工具。
4. 查看活动块以了解哪些文件被读取或更改。
5. 如果您只想探索，请在"提问"模式下开始。当您准备进行更改时切换到"Agent"模式。

## 下一步

- [知识发现](/guides/knowledge-discovery)：语义搜索和知识图谱
- [聊天界面](/guides/chat-interface)：附件、历史记录和快捷方式
- [办公文档](/guides/office-documents)：从笔记创建 PPTX、DOCX 和 XLSX