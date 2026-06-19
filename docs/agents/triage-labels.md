---
title: obsilo Triage Labels 配置
type: agents-config
parent: AGENTS.md
---

# Triage Labels

使用 Matt Pocock **默认 5 类状态机标签**（无需自定义）：

| 标签 | 含义 | 触发动作 |
|---|---|---|
| `status: ready-for-agent` | 需求清晰、上下文完整、用户已拍板 | agent 可直接实现 |
| `status: needs-triage` | 信息不全、需澄清 | owner 拍板前不实现 |
| `status: in-progress` | agent 已开 PR | 阻塞其他 PR |
| `status: blocked` | 依赖外部（其他 PR / 外部库 / 用户输入） | 标依赖项 |
| `status: needs-human-review` | agent 完成后需 owner 验收 | owner review |

## 状态机迁移

```
needs-triage  ──► ready-for-agent  ──► in-progress  ──► needs-human-review  ──► (close)
   │                                       │
   │                                       └─► blocked  ──► ready-for-agent
   │
   └─► (close as wontfix)
```

## 标签所有权

- **agent 可贴**：`status: ready-for-agent`、`status: in-progress`、`status: blocked`、`status: needs-human-review`
- **owner 才能贴**：`needs-triage` 拍板后变 `ready-for-agent`