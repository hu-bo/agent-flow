# Design Document: Spec Content Visibility Control

## Overview

This document describes the technical design for routing spec document content (requirements, design, task breakdown) to a dedicated sidebar panel in spec mode, while displaying compact placeholders in the chat stream.

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            User Interface                                │
│  ┌──────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │     ChatPanel            │  │     SpecDocPane (MDEditor)          │  │
│  │                          │  │                                     │  │
│  │  ┌────────────────────┐  │  │  ┌─────────────────────────────┐   │  │
│  │  │ UserMessage        │  │  │  │ Phase Indicator Bar          │   │  │
│  │  └────────────────────┘  │  │  │ [Req] → [Design] → [Tasks]  │   │  │
│  │                          │  │  └─────────────────────────────┘   │  │
│  │  ┌────────────────────┐  │  │                                     │  │
│  │  │ SpecPlaceholder    │  │  │  ┌─────────────────────────────┐   │  │
│  │  │ "Requirements Doc" │  │  │  │ MDEditor                    │   │  │
│  │  │ [View in Sidebar]  │  │  │  │ (full markdown content)     │   │  │
│  │  └────────────────────┘  │  │  └─────────────────────────────┘   │  │
│  │                          │  │                                     │  │
│  │  ┌────────────────────┐  │  │                                     │  │
│  │  │ AssistantMessage   │  │  │                                     │  │
│  │  │ (normal content)   │  │  │                                     │  │
│  │  └────────────────────┘  │  │                                     │  │
│  └──────────────────────────┘  └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ SSE Stream
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        web-server (Fastify)                              │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  SpecWorkflowService                                             │    │
│  │  - Detects spec document generation                              │    │
│  │  - Updates SpecWorkflowState with message IDs                    │    │
│  │  - Emits spec_doc_update events alongside msg_delta              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Relationships

```
SpecPage
├── SpecWorkflowPanel (phase indicator)
├── SpecDocPane (left panel)
│   ├── SpecPhaseTabs
│   └── MDEditor
└── SpecChatPane (right panel)
    └── ChatPanel
        ├── MessageList
        │   └── MessageBubble
        │       ├── SpecPlaceholderRenderer (for spec docs)
        │       └── StandardRenderers (for other content)
        └── InputArea
```

## Data Models

### SpecWorkflowState (existing, extended)

```typescript
// apps/web-ui/src/api.ts
export interface SpecWorkflowState {
  phase: 'requirements' | 'design' | 'tasks';
  awaitingConfirm: boolean;
  requirementsMsgId?: string;
  designMsgId?: string;
  taskListMsgId?: string;
  documents?: Partial<Record<SpecDocType, string>>;  // NEW: cached content
}

export type SpecDocType = 'requirements' | 'design' | 'tasks';
```

### SSE Event Types (extended)

```typescript
// apps/web-ui/src/api.ts
export type ChatStreamEvent =
  | { type: 'msg'; msg: UnifiedMessage }
  | { type: 'msg_delta'; msg_id: string; delta: string }
  | { type: 'spec_doc_update';    // NEW
      msg_id: string;
      doc_type: SpecDocType;
      content: string;
      delta?: string;
      done: boolean;
    }
  | { type: 'approval_req'; approval: ApprovalReqPayload }
  | { type: 'error'; err: { code: string; msg: string; details?: unknown } };
```

### ContentPart Extension

```typescript
// packages/core/src/messages/message.ts
export interface SpecDocPart {
  type: 'spec-doc';
  docType: SpecDocType;
  content: string;
  summary?: string;
}

// Note: For this implementation, we will NOT add a new ContentPart type.
// Instead, we use message metadata to identify spec documents, which is
// less invasive and maintains backward compatibility.
```

## API Design

### GET /api/spec/:sessionId/state

Returns spec workflow state with cached document content:

```typescript
// Response
{
  sessionId: string;
  mode: 'spec';
  specWorkflow: SpecWorkflowState & {
    documents: {
      requirements?: string;
      design?: string;
      tasks?: string;
    };
  };
}
```

### POST /api/spec/:sessionId/confirm

Confirms current phase and advances to next:

```typescript
// Request
{
  selected_artifacts?: string[];  // For design phase options
}

// Response
{
  session: SessionRecord;
  messages: UnifiedMessage[];
  specWorkflow: SpecWorkflowState;
  progressed: boolean;
}
```

## Frontend Components

### SpecPage Layout

```typescript
// apps/web-ui/src/pages/SpecPage.tsx
export function SpecPage() {
  const [specState, setSpecState] = useState<SpecWorkflowState | null>(null);
  const [specDocuments, setSpecDocuments] = useState<{
    requirements?: string;
    design?: string;
    tasks?: string;
  }>({});
  
  // Filter messages: exclude spec doc content from chat
  const chatMessages = useMemo(() => 
    messages.filter(shouldRenderInChat),
    [messages, specState]
  );
  
  return (
    <div className="spec-layout">
      <SpecDocPane
        documents={specDocuments}
        phase={specState?.phase}
        onUpdate={handleSpecDocUpdate}
      />
      <SpecChatPane
        messages={chatMessages}
        specState={specState}
        onSend={handleSend}
      />
    </div>
  );
}
```

### SpecDocPane Component

```typescript
// apps/web-ui/src/components/SpecDocPane/SpecDocPane.tsx
interface SpecDocPaneProps {
  documents: Partial<Record<SpecDocType, string>>;
  phase: SpecDocType;
  isStreaming: boolean;
  streamingDocType?: SpecDocType;
}

export function SpecDocPane({ documents, phase, isStreaming, streamingDocType }: SpecDocPaneProps) {
  const [activeTab, setActiveTab] = useState<SpecDocType>(phase);
  
  return (
    <section className="spec-doc-pane">
      <SpecPhaseTabs
        phases={['requirements', 'design', 'tasks']}
        activeTab={activeTab}
        completed={getCompletedPhases(phase)}
        onTabChange={setActiveTab}
      />
      <div className="spec-doc-editor">
        <MDEditor
          value={documents[activeTab] ?? ''}
          preview="edit"
          hideToolbar={true}
        />
        {isStreaming && streamingDocType === activeTab && (
          <StreamingIndicator />
        )}
      </div>
    </section>
  );
}
```

### SpecPlaceholderRenderer

```typescript
// packages/chat-ui/src/renderers/SpecPlaceholderRenderer.tsx
interface SpecPlaceholderProps {
  docType: SpecDocType;
  message: ChatMessage;
  onViewInSidebar: () => void;
}

export function SpecPlaceholderRenderer({ docType, message, onViewInSidebar }: SpecPlaceholderProps) {
  return (
    <div className="spec-placeholder" role="region" aria-label={`${docType} document`}>
      <div className="spec-placeholder-icon">
        <FileTextIcon />
      </div>
      <div className="spec-placeholder-content">
        <span className="spec-placeholder-title">
          {docType.charAt(0).toUpperCase() + docType.slice(1)} Document
        </span>
        <span className="spec-placeholder-hint">
          Generated {formatTimestamp(message.timestamp)}
        </span>
      </div>
      <button
        className="spec-placeholder-action"
        onClick={onViewInSidebar}
        aria-label={`View ${docType} in sidebar`}
      >
        <ExternalLinkIcon />
        View in Sidebar
      </button>
    </div>
  );
}
```

### Message Filtering Logic

```typescript
// apps/web-ui/src/pages/chat-page-utils.ts
export function shouldRenderInChat(
  message: ChatMessage,
  specState: SpecWorkflowState | null
): boolean {
  if (!specState) return true;
  
  const specMsgIds = [
    specState.requirementsMsgId,
    specState.designMsgId,
    specState.taskListMsgId,
  ].filter(Boolean);
  
  // Full content is hidden, placeholder will be shown
  return !specMsgIds.includes(message.uuid);
}

export function isSpecDocumentMessage(
  message: ChatMessage,
  specState: SpecWorkflowState | null
): { isSpecDoc: boolean; docType?: SpecDocType } {
  if (!specState) return { isSpecDoc: false };
  
  if (message.uuid === specState.requirementsMsgId) {
    return { isSpecDoc: true, docType: 'requirements' };
  }
  if (message.uuid === specState.designMsgId) {
    return { isSpecDoc: true, docType: 'design' };
  }
  if (message.uuid === specState.taskListMsgId) {
    return { isSpecDoc: true, docType: 'tasks' };
  }
  
  return { isSpecDoc: false };
}
```

## Backend Service Design

### SpecWorkflowService

```typescript
// apps/web-server/src/services/spec-workflow-service.ts
export class SpecWorkflowService {
  private specPatterns = {
    requirements: /^#\s+(Requirements?|需求)\s*(Document|文档)?/i,
    design: /^#\s+(Design|设计)\s*(Document|文档)?/i,
    tasks: /^#\s+(Tasks?|任务|Task\s+Breakdown)/i,
  };
  
  async processStreamingMessage(
    sessionId: string,
    messageId: string,
    content: string,
    isComplete: boolean
  ): Promise<void> {
    const state = await this.getSpecWorkflowState(sessionId);
    const detectedType = this.detectSpecDocument(content);
    
    if (detectedType && isComplete) {
      // Update state with message ID
      await this.updateSpecWorkflowState(sessionId, {
        ...state,
        [`${detectedType}MsgId`]: messageId,
      });
    }
    
    // Emit spec_doc_update event
    this.emitSpecDocUpdate(sessionId, messageId, detectedType, content, isComplete);
  }
  
  private detectSpecDocument(content: string): SpecDocType | null {
    for (const [type, pattern] of Object.entries(this.specPatterns)) {
      if (pattern.test(content.trim())) {
        return type as SpecDocType;
      }
    }
    return null;
  }
}
```

### SSE Event Emission

```typescript
// apps/web-server/src/handlers/chat-handler.ts
async function* streamChatResponse(input: ChatInput): AsyncGenerator<ChatStreamEvent> {
  const specWorkflow = input.mode === 'spec' 
    ? await specWorkflowService.getOrCreateState(input.session_id)
    : null;
  
  let buffer = '';
  let detectedSpecType: SpecDocType | null = null;
  
  for await (const chunk of modelAdapter.streamChat(prompt)) {
    buffer += chunk.text;
    
    // Detect spec document during streaming
    if (!detectedSpecType) {
      detectedSpecType = specWorkflowService.detectSpecDocument(buffer);
    }
    
    // Emit standard msg_delta
    yield { type: 'msg_delta', msg_id: messageId, delta: chunk.text };
    
    // Also emit spec_doc_update if spec document detected
    if (detectedSpecType) {
      yield {
        type: 'spec_doc_update',
        msg_id: messageId,
        doc_type: detectedSpecType,
        content: buffer,
        done: false,
      };
    }
  }
  
  // Final events on completion
  yield { type: 'msg', msg: finalMessage };
  
  if (detectedSpecType) {
    yield {
      type: 'spec_doc_update',
      msg_id: messageId,
      doc_type: detectedSpecType,
      content: buffer,
      done: true,
    };
    
    // Persist state
    await specWorkflowService.updateState(input.session_id, detectedSpecType, messageId);
  }
}
```

## State Management

### Frontend State (Zustand)

```typescript
// apps/web-ui/src/store/spec-store.ts
interface SpecState {
  specWorkflow: SpecWorkflowState | null;
  documents: Partial<Record<SpecDocType, string>>;
  streamingDocType: SpecDocType | null;
  
  setSpecWorkflow: (state: SpecWorkflowState) => void;
  updateDocument: (type: SpecDocType, content: string) => void;
  setStreaming: (docType: SpecDocType | null) => void;
}

export const useSpecStore = create<SpecState>((set) => ({
  specWorkflow: null,
  documents: {},
  streamingDocType: null,
  
  setSpecWorkflow: (state) => set({ specWorkflow: state }),
  updateDocument: (type, content) => set((s) => ({
    documents: { ...s.documents, [type]: content },
  })),
  setStreaming: (docType) => set({ streamingDocType: docType }),
}));
```

### Event Handling Hook

```typescript
// apps/web-ui/src/hooks/useSpecDocStream.ts
export function useSpecDocStream(sessionId: string | null) {
  const { updateDocument, setStreaming } = useSpecStore();
  
  const handleSpecDocUpdate = useCallback((event: SpecDocUpdateEvent) => {
    updateDocument(event.doc_type, event.content);
    setStreaming(event.done ? null : event.doc_type);
  }, [updateDocument, setStreaming]);
  
  return { handleSpecDocUpdate };
}
```

## Styling

### SpecDocPane Styles

```less
// apps/web-ui/src/pages/pages.less
.spec-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  height: calc(100vh - 120px);
}

.spec-doc-pane {
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  background: var(--surface-color);
}

.spec-doc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.spec-doc-editor {
  flex: 1;
  overflow: auto;
}

.spec-placeholder {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--surface-soft-color);
  border-radius: 8px;
  border: 1px dashed var(--border-color);
}

.spec-placeholder-action {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: var(--brand-color);
  color: white;
  border-radius: 4px;
  cursor: pointer;
}
```

## Error Handling

### Graceful Degradation

```typescript
// Frontend fallback
const specDocument = specDocuments[activeTab] ?? 
  messages.find(m => m.uuid === specState?.[`${activeTab}MsgId`])?.content
    ?.filter(p => p.type === 'text')
    ?.map(p => p.text)
    ?.join('\n') ?? '';
```

### Retry Mechanism

```typescript
// apps/web-ui/src/pages/SpecPage.tsx
const handleRetryLoadSpec = async (docType: SpecDocType) => {
  try {
    const msgId = specState?.[`${docType}MsgId`];
    if (!msgId) return;
    
    const { messages } = await fetchSession(activeSession!);
    const msg = messages.find(m => m.uuid === msgId);
    if (msg) {
      const content = extractTextContent(msg);
      updateDocument(docType, content);
    }
  } catch (error) {
    setNotice({ kind: 'error', message: `Failed to load ${docType} document` });
  }
};
```

## Performance Considerations

1. **Virtualized Scrolling**: For large spec documents (>10,000 lines), use `react-window` in MDEditor
2. **Debounced Updates**: Batch `spec_doc_update` events during rapid streaming
3. **Lazy Loading**: Only fetch spec document content when tab becomes active
4. **Memoization**: Cache parsed markdown to avoid re-parsing on every render

## Migration Strategy

1. **Phase 1**: Add `spec_doc_update` SSE event type (backward compatible)
2. **Phase 2**: Implement SpecDocPane component with phase tabs
3. **Phase 3**: Add message filtering in SpecPage
4. **Phase 4**: Implement SpecPlaceholderRenderer
5. **Phase 5**: Wire up state management and streaming

## Testing Strategy

### Unit Tests

- `shouldRenderInChat` function tests
- `detectSpecDocument` pattern matching tests
- State management reducer tests

### Integration Tests

- SSE event handling with spec_doc_update
- Phase transition flow
- Sidebar-chat synchronization

### E2E Tests

- Full spec workflow from requirements to tasks
- Streaming document appearance in sidebar
- Error recovery scenarios

## Security Considerations

1. **Content Sanitization**: All markdown content passed to MDEditor must be sanitized
2. **Access Control**: Verify session ownership before returning spec documents
3. **Rate Limiting**: Limit spec_doc_update event frequency during streaming
