---
title: Office 文档
description: 如何在 Obsidian 知识库中直接创建和读取 PPTX、DOCX、XLSX 和 PDF 文件。
---

# Office 文档

Obsilo 可以在你的知识库中直接创建 PowerPoint 演示文稿、Word 文档和 Excel 电子表格。它也可以读取这些文件，提取文本和结构用于对话上下文。

## 创建文档

三个内置工具处理文件创建：

- `create_pptx` — PowerPoint 演示文稿
- `create_docx` — Word 文档
- `create_xlsx` — Excel 电子表格

每个工具都将二进制文件写入知识库，使用共享的 `writeBinaryToVault()` 工具，并带有路径遍历保护。

## 创建 PowerPoint

PPTX 是最复杂的，因为演示文稿有重要的视觉结构。

### 两种模式

**临时模式**（无模板）：使用 PptxGenJS 从头构建幻灯片。Agent 指定幻灯片内容（标题、项目符号、图片），库生成一个干净但通用的演示文稿。适合快速草稿或没有公司模板时。

**模板模式**（有模板）：使用现有的 `.pptx` 模板文件，通过 pptx-automizer 填充内容。你的企业幻灯片模板成为基础，Agent 在保留模板设计、字体和布局的同时填入内容。这是生成演示质量输出的模式。

### plan_presentation 工具

关键步骤发生在生成之前。原始材料（会议记录、研究内容、项目符号）必须转化为结构化的幻灯片内容。

`plan_presentation` 工具通过专用内部 LLM 调用来解决这个问题：

1. 读取源材料和模板目录
2. 从源材料中提取关键信息
3. 从目录中选择合适的幻灯片类型
4. 为每个幻灯片上的每个非装饰性形状生成内容
5. 根据目录验证计划（所有必需形状都有内容吗？形状名称有效吗？占位符都解析了吗？）

输出是一个 `DeckPlan`，`create_pptx` 直接消费它。将计划与生成分离让你可以在提交文件之前审查和调整计划。

## 读取 Office 文件

读取 Office 文件是相反的方向。`parseDocument` 函数根据文件扩展名路由到专用解析器：

| 格式 | 解析器 | 提取内容 |
|------|--------|----------|
| PPTX/POTX | `PptxParser` | 幻灯片文本、演讲者备注、幻灯片顺序 |
| DOCX | `DocxParser` | 段落、标题、表格 |
| XLSX | `XlsxParser` | 工作表名称、单元格数据、公式 |
| PDF | `PdfParser` | 页面文本、基本结构 |
| CSV/JSON | `CsvParser` / `parseJson` | 结构化数据 |

解析后的内容以结构化文本形式返回，Agent 可以用作上下文。

## 质量检查

某些工具（`create_pptx`、`create_docx`、`create_xlsx`）包含自我检查步骤，Agent 在其中验证输出是否达到质量标准。

对于 PPTX，可以使用 `render_presentation` 工具将 PPTX 文件渲染为图片进行视觉质量检查。

## 下一步

- [工具参考](../reference/tools) — 所有内置工具的完整列表
- [工具系统](../concepts/tool-system) — 工具如何工作的深入解释