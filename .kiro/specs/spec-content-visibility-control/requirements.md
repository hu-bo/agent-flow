# Requirements Document

## Introduction

This document specifies requirements for the Spec Content Visibility Control feature in the agent-flow LLM chat platform. The feature ensures that when users work in spec mode, structured markdown documents (requirements, design, task breakdown) are routed to a dedicated sidebar view instead of appearing as regular message bubbles in the chat stream. This improves focus on conversational flow while keeping spec documents accessible and persistent.

## Glossary

- **SpecWorkflowService**: Backend service that manages spec workflow state and detects spec document generation (apps/web-server/src/services/spec-workflow-service.ts)
- **SessionMode**: Enum distinguishing between 'vibe' (standard chat) and 'spec' (structured workflow) session types
- **SpecWorkflowPhase**: Enum representing the three phases of spec workflow: 'requirements', 'design', 'tasks'
- **SpecWorkflowState**: State object tracking current phase, confirmation status, and message IDs for each spec document
- **MessageBubble**: React component that renders chat messages in the conversation stream (packages/chat-ui/src/components/MessageBubble)
- **ContentRendererRegistry**: Registry pattern for content type renderers used by MessageBubble
- **Sidebar**: React component displaying session list and workspace navigation (apps/web-ui/src/components/Sidebar)
- **SpecContentView**: New React component to display spec documents in the sidebar
- **SpecDocumentType**: Union type representing the three document types: 'requirements', 'design', 'tasks'
- **SpecDocument**: Data structure containing document type, content, message ID, and phase status
- **SSE (Server-Sent Events)**: Streaming protocol used for real-time message delivery from web-server to web-ui
- **msg_delta**: SSE event type for streaming incremental text content
- **UnifiedMessage**: Core message type with uuid, role, content parts, timestamp, and metadata

## Requirements

### Requirement 1: Spec Document Detection and Routing

**User Story:** As a developer working in spec mode, I want spec documents to be automatically detected and routed to the sidebar, so that the chat stream remains focused on conversation.

#### Acceptance Criteria

1. WHEN the SpecWorkflowService detects a requirements document in an assistant message, THE SpecWorkflowService SHALL store the message ID in SpecWorkflowState.requirementsMsgId
2. WHEN the SpecWorkflowService detects a design document in an assistant message, THE SpecWorkflowService SHALL store the message ID in SpecWorkflowState.designMsgId
3. WHEN the SpecWorkflowService detects a task breakdown document in an assistant message, THE SpecWorkflowService SHALL store the message ID in SpecWorkflowState.taskListMsgId
4. WHILE a session is in spec mode, THE Backend SHALL include specWorkflow state in session API responses
5. WHEN the frontend receives a session with specWorkflow state, THE Frontend SHALL extract spec document message IDs from the state

### Requirement 2: Message Interception in Chat Stream

**User Story:** As a user in spec mode, I want spec document content to be replaced with a compact placeholder in the chat stream, so that I can focus on the conversational flow.

#### Acceptance Criteria

1. WHEN MessageBubble renders a message whose ID matches requirementsMsgId, THE MessageBubble SHALL render a SpecPlaceholder component instead of full content
2. WHEN MessageBubble renders a message whose ID matches designMsgId, THE MessageBubble SHALL render a SpecPlaceholder component instead of full content
3. WHEN MessageBubble renders a message whose ID matches taskListMsgId, THE MessageBubble SHALL render a SpecPlaceholder component instead of full content
4. WHILE rendering a SpecPlaceholder, THE Frontend SHALL display the document type label and a "View in Sidebar" action
5. WHEN the user clicks the "View in Sidebar" action, THE Frontend SHALL scroll the sidebar to reveal the corresponding spec document

### Requirement 3: Spec Content View in Sidebar

**User Story:** As a user in spec mode, I want to view the full spec documents in a dedicated sidebar panel, so that I can reference them while working through the workflow.

#### Acceptance Criteria

1. WHEN a session is in spec mode, THE Sidebar SHALL display a SpecContentView panel
2. WHEN the SpecContentView receives spec document content, THE SpecContentView SHALL render the markdown with proper syntax highlighting
3. WHEN the user switches between spec phases, THE SpecContentView SHALL display the current phase document prominently
4. WHILE displaying spec documents, THE Frontend SHALL show phase indicators (requirements → design → tasks) with completion status
5. WHEN a spec document is being streamed, THE SpecContentView SHALL display a loading indicator and partial content

### Requirement 4: Real-time Streaming Support

**User Story:** As a user in spec mode, I want to see spec documents appear in the sidebar as they are generated, so that I can follow along with the LLM's output in real-time.

#### Acceptance Criteria

1. WHEN the frontend receives a msg_delta event for a spec document message, THE Frontend SHALL update the SpecContentView with the incremental content
2. WHILE streaming a spec document, THE Frontend SHALL display a streaming indicator in the sidebar
3. WHEN streaming completes for a spec document, THE Frontend SHALL remove the streaming indicator and mark the document as complete
4. IF streaming is interrupted for a spec document, THE Frontend SHALL display a partial content indicator
5. WHEN the user navigates away and returns during streaming, THE Frontend SHALL resume displaying the current streaming state

### Requirement 5: Phase Navigation and History

**User Story:** As a user in spec mode, I want to navigate between spec documents across phases, so that I can review requirements while working on design and tasks.

#### Acceptance Criteria

1. WHEN the user clicks a phase tab in SpecContentView, THE Frontend SHALL display the corresponding spec document
2. WHILE viewing a previous phase document, THE Frontend SHALL visually indicate the current workflow phase
3. WHEN a phase has not yet generated its document, THE Frontend SHALL display a placeholder indicating pending status
4. WHEN the user confirms a phase and advances, THE Frontend SHALL update the phase navigation to reflect progress
5. FOR ALL completed phases, THE Frontend SHALL preserve and display the spec document content

### Requirement 6: Vibe Mode Isolation

**User Story:** As a user switching between modes, I want vibe mode to remain unaffected by spec visibility controls, so that my existing workflow is preserved.

#### Acceptance Criteria

1. WHEN a session is in vibe mode, THE Frontend SHALL render all messages using standard MessageBubble content rendering
2. WHEN a session is in vibe mode, THE Sidebar SHALL NOT display the SpecContentView panel
3. IF a session transitions from spec to vibe mode, THE Frontend SHALL remove spec-specific UI elements
4. WHEN a session is in vibe mode, THE Backend SHALL NOT include specWorkflow state in session responses

### Requirement 7: Content Renderer Integration

**User Story:** As a developer extending the chat UI, I want spec content interception to integrate with the existing ContentRendererRegistry pattern, so that the implementation is consistent with the architecture.

#### Acceptance Criteria

1. WHEN registering the spec content renderer, THE Frontend SHALL use ContentRendererRegistry.register with a 'spec-document' type
2. WHEN the ContentRendererRegistry encounters a spec document part, THE Registry SHALL delegate to SpecPlaceholderRenderer
3. WHILE the SpecPlaceholderRenderer is active, THE Renderer SHALL accept message and context props including specWorkflow state
4. FOR ALL spec document types, THE SpecPlaceholderRenderer SHALL provide consistent placeholder UI

### Requirement 8: API Contract Extensions

**User Story:** As a developer integrating frontend and backend, I want the API contract to include spec document metadata, so that the frontend can efficiently route content.

#### Acceptance Criteria

1. WHEN the session API returns a spec mode session, THE Response SHALL include specWorkflow.phase field
2. WHEN the session API returns a spec mode session, THE Response SHALL include specWorkflow.requirementsMsgId field if the requirements document exists
3. WHEN the session API returns a spec mode session, THE Response SHALL include specWorkflow.designMsgId field if the design document exists
4. WHEN the session API returns a spec mode session, THE Response SHALL include specWorkflow.taskListMsgId field if the task breakdown document exists
5. WHEN the session API returns a spec mode session, THE Response SHALL include specWorkflow.awaitingConfirm boolean field

### Requirement 9: Accessibility Compliance

**User Story:** As a user with assistive technology, I want spec content controls to be accessible, so that I can navigate and interact with spec documents effectively.

#### Acceptance Criteria

1. WHEN the SpecPlaceholder renders, THE Component SHALL include an aria-label describing the document type
2. WHEN the "View in Sidebar" action renders, THE Button SHALL have an accessible name and role
3. WHEN the SpecContentView displays spec documents, THE Panel SHALL have appropriate ARIA landmarks
4. WHILE navigating phase tabs, THE Frontend SHALL support keyboard navigation and focus management
5. WHEN focus moves between chat and sidebar, THE Frontend SHALL manage focus programmatically for screen reader users

### Requirement 10: Error Handling and Recovery

**User Story:** As a user in spec mode, I want graceful error handling when spec content fails to load, so that I can continue working without data loss.

#### Acceptance Criteria

1. IF the spec document message fails to load from the backend, THE Frontend SHALL display an error placeholder with retry action
2. IF streaming fails mid-document, THE Frontend SHALL preserve partial content and indicate incomplete status
3. WHEN the user retries loading a spec document, THE Frontend SHALL attempt to fetch the full message content
4. IF the specWorkflow state becomes inconsistent, THE Frontend SHALL fall back to standard message rendering
5. WHEN an error occurs in spec content rendering, THE Frontend SHALL log the error and notify the user without crashing the chat

## Correctness Properties

### Property 1: Spec Document Routing Invariant

**Invariant:** FOR ALL messages in a spec mode session, IF message.uuid equals specWorkflow.{phase}MsgId, THEN the message content SHALL be rendered in the SpecContentView, NOT in MessageBubble.

**Test Strategy:** Generate messages with matching IDs and verify routing behavior using model-based testing comparing actual rendering to expected routing.

### Property 2: Phase Order Conformance

**Invariant:** FOR ALL spec workflow sessions, the phase progression SHALL follow the sequence: requirements → design → tasks. No phase SHALL be skipped.

**Test Strategy:** State machine property test that validates phase transitions against allowed sequences.

### Property 3: Vibe Mode Isolation

**Invariant:** FOR ALL vibe mode sessions, the SpecContentView component SHALL NOT be mounted, and all messages SHALL use standard rendering.

**Test Strategy:** Property test that verifies no spec UI components are present when SessionMode = 'vibe'.

### Property 4: Streaming State Consistency

**Invariant:** FOR ALL streaming spec documents, the content in SpecContentView SHALL equal the accumulated msg_delta content for that message ID.

**Test Strategy:** Round-trip property test comparing streaming accumulator state with displayed content after each delta.

### Property 5: Message ID Reference Integrity

**Invariant:** FOR ALL SpecWorkflowState objects, IF a phase message ID is set, THEN a message with that ID SHALL exist in the session message list.

**Test Strategy:** Reference integrity property test that validates all set message IDs exist in the message collection.

### Property 6: Sidebar-Chat Synchronization

**Invariant:** WHEN a spec document placeholder is clicked in MessageBubble, THEN the corresponding document SHALL be visible and scrolled into view in SpecContentView.

**Test Strategy:** Integration test property verifying navigation action results in correct sidebar state.

### Property 7: Partial Content Preservation

**Invariant:** FOR ALL interrupted spec document streams, the displayed partial content SHALL equal the successfully received deltas, without corruption or loss.

**Test Strategy:** Metamorphic property test comparing partial stream content with full content when available.

### Property 8: Mode Switch State Cleanup

**Invariant:** WHEN session mode transitions from 'spec' to 'vibe', THEN all spec-specific state (SpecContentView, placeholders) SHALL be removed within one render cycle.

**Test Strategy:** State transition property test measuring cleanup completeness after mode switch.

## Edge Cases

### Edge Case 1: Rapid Phase Transitions

WHEN a user rapidly confirms phases before documents are fully streamed, THE System SHALL handle the transition gracefully and preserve all partial content.

### Edge Case 2: Concurrent Streaming

IF multiple spec documents are being streamed simultaneously (edge case), THE Frontend SHALL display streaming indicators for all active documents without conflict.

### Edge Case 3: Message ID Collision

IF a non-spec message happens to have the same ID pattern as a spec document, THE System SHALL use content detection (not just ID matching) to determine routing.

### Edge Case 4: Large Spec Documents

WHEN a spec document exceeds typical size limits, THE Sidebar SHALL implement virtualized scrolling to maintain performance.

### Edge Case 5: Session Restoration

WHEN a user reloads the page or reconnects, THE Frontend SHALL restore spec content state from the session API without loss.
