# @agent-flow/checkpoint

检查点与恢复机制，支持本地文件检查点和远程 WAL（Write-Ahead Logging）。

## 主要导出

| 导出 | 说明 |
|------|------|
| `LocalCheckpointManager` | 本地文件检查点管理 |
| `RemoteCheckpointManager` | 远程 WAL 检查点管理 |
| `TaskStateMachine` | 任务状态机 |

### 类型

`Checkpoint`, `ToolExecutionState`, `FileHistoryEntry`, `TodoItem`, `TaskStatus`, `WALEntry`

## 依赖

- `@agent-flow/model-contracts`

## 使用

```ts
import { LocalCheckpointManager, TaskStateMachine } from '@agent-flow/checkpoint';

const checkpointMgr = new LocalCheckpointManager('./checkpoints');
await checkpointMgr.save(state);
```

## 构建

```bash
pnpm --filter @agent-flow/checkpoint build
```
