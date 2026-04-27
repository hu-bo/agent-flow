# @agent-flow/chat-ui

可扩展的 React 聊天面板组件库，供 Playground 等前端应用使用。

## 技术栈

- React 18+ / TypeScript
- Vite 构建 + tsc 声明文件
- Tailwind CSS + Less
- ES Module 输出

## 使用

```bash
pnpm add @agent-flow/chat-ui
```

```tsx
import { ChatPanel } from '@agent-flow/chat-ui';
import '@agent-flow/chat-ui/styles.css';

<ChatPanel messages={messages} onSend={handleSend} />
```

## 主要导出

| 组件 | 说明 |
|------|------|
| `ChatPanel` | 聊天面板主组件 |
| `MessageList` | 消息列表 |
| `MessageBubble` | 单条消息气泡 |
| `InputArea` | 输入区域 |
| `SelectField` | 选择器字段 |

### 内容渲染器

支持多种消息内容类型的渲染：

| 渲染器 | 说明 |
|--------|------|
| `TextRenderer` | Markdown 渲染（`react-markdown` + `remark-gfm`） |
| `ThinkingRenderer` | 思维链展示 |
| `ImageRenderer` | 图片展示 |
| `CodeDiffRenderer` | 代码差异对比（`diff` + `highlight.js`） |
| `ToolCallRenderer` | 工具调用展示 |
| `ToolResultRenderer` | 工具结果展示 |
| `FileAttachmentRenderer` | 文件附件展示 |

### 渲染器注册

通过 `registry.ts` 支持自定义渲染器注册，可扩展新的消息内容类型。

## Peer Dependencies

- `react >= 18`
- `react-dom >= 18`

```bash
# 构建
pnpm --filter @agent-flow/chat-ui build

# 类型检查
pnpm --filter @agent-flow/chat-ui typecheck
```
