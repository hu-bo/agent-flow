# Task Breakdown: Spec Content Visibility Control

## Overview

This document outlines the implementation tasks for routing spec document content to a dedicated sidebar panel while showing placeholders in the chat stream.

## Task List

- [ ] 1. Backend: Extend SSE Event Types and Spec State
  - [ ] 1.1 Add `spec_doc_update` event type to `ChatStreamEvent` union in `apps/web-ui/src/api.ts`
  - [ ] 1.2 Extend `SpecWorkflowState` to include `documents` field for cached content
  - [ ] 1.3 Add `SpecDocType` type alias in `apps/web-ui/src/api.ts`
  - [ ] 1.4 Update `fetchSpecState` response type to include documents

- [ ] 2. Backend: Implement SpecWorkflowService Document Detection
  - [ ] 2.1 Create `SpecWorkflowService` class in `apps/web-server/src/services/spec-workflow-service.ts`
  - [ ] 2.2 Implement `detectSpecDocument` method with regex patterns for requirements/design/tasks
  - [ ] 2.3 Implement `processStreamingMessage` to detect and emit events during streaming
  - [ ] 2.4 Add unit tests for document detection patterns

- [ ] 3. Backend: Integrate Spec Doc Events in Chat Handler
  - [ ] 3.1 Import `SpecWorkflowService` in chat handler
  - [ ] 3.2 Add spec document detection during `streamChatResponse` generator
  - [ ] 3.3 Emit `spec_doc_update` events alongside `msg_delta` for detected spec documents
  - [ ] 3.4 Update `SpecWorkflowState` with message IDs on completion
  - [ ] 3.5 Add integration tests for SSE event emission

- [ ] 4. Frontend: Create Spec Document State Management
  - [ ] 4.1 Create `apps/web-ui/src/store/spec-store.ts` with Zustand store
  - [ ] 4.2 Define `SpecState` interface with documents, streaming status
  - [ ] 4.3 Implement `updateDocument` and `setStreaming` actions
  - [ ] 4.4 Add selector hooks for document access by phase

- [ ] 5. Frontend: Implement Event Handling Hook
  - [ ] 5.1 Create `apps/web-ui/src/hooks/useSpecDocStream.ts`
  - [ ] 5.2 Implement `handleSpecDocUpdate` callback for SSE events
  - [ ] 5.3 Wire up to `useChat` hook's event handling
  - [ ] 5.4 Add error handling for streaming interruptions

- [ ] 6. Frontend: Create SpecDocPane Component
  - [ ] 6.1 Create `apps/web-ui/src/components/SpecDocPane/SpecDocPane.tsx`
  - [ ] 6.2 Implement phase tab navigation (requirements → design → tasks)
  - [ ] 6.3 Add MDEditor integration for markdown display
  - [ ] 6.4 Implement streaming indicator for active document
  - [ ] 6.5 Add empty state for pending phases
  - [ ] 6.6 Create `SpecDocPane.less` styles following light workspace guidelines

- [ ] 7. Frontend: Create SpecPhaseTabs Component
  - [ ] 7.1 Create `apps/web-ui/src/components/SpecDocPane/SpecPhaseTabs.tsx`
  - [ ] 7.2 Implement tab styling with completion status indicators
  - [ ] 7.3 Add keyboard navigation support (arrow keys)
  - [ ] 7.4 Implement ARIA attributes for accessibility
  - [ ] 7.5 Add click handler for tab switching

- [ ] 8. Frontend: Create SpecPlaceholderRenderer Component
  - [ ] 8.1 Create `packages/chat-ui/src/renderers/SpecPlaceholderRenderer.tsx`
  - [ ] 8.2 Design placeholder UI with document type label and timestamp
  - [ ] 8.3 Add "View in Sidebar" action button
  - [ ] 8.4 Implement click handler to scroll sidebar to document
  - [ ] 8.5 Create `SpecPlaceholderRenderer.less` styles
  - [ ] 8.6 Add ARIA attributes for accessibility

- [ ] 9. Frontend: Implement Message Filtering Logic
  - [ ] 9.1 Add `isSpecDocumentMessage` function to `chat-page-utils.ts`
  - [ ] 9.2 Add `shouldRenderInChat` function to filter spec docs from chat
  - [ ] 9.3 Update `SpecPage.tsx` to filter messages before passing to ChatPanel
  - [ ] 9.4 Map filtered spec messages to SpecPlaceholderRenderer components

- [ ] 10. Frontend: Integrate SpecDocPane into SpecPage Layout
  - [ ] 10.1 Update `SpecPage.tsx` to use two-column grid layout
  - [ ] 10.2 Add SpecDocPane as left panel
  - [ ] 10.3 Move ChatPanel to right panel
  - [ ] 10.4 Wire up state management (spec-store, useSpecDocStream)
  - [ ] 10.5 Update `pages.less` with `.spec-layout` grid styles
  - [ ] 10.6 Handle responsive behavior for narrow screens

- [ ] 11. Frontend: Implement Sidebar Scroll Navigation
  - [ ] 11.1 Add `scrollToDocument` function in SpecDocPane
  - [ ] 11.2 Wire up "View in Sidebar" action to trigger scroll
  - [ ] 11.3 Highlight active document after navigation
  - [ ] 11.4 Add smooth scroll animation

- [ ] 12. Frontend: Handle Phase Transitions
  - [ ] 12.1 Update active tab when `specWorkflow.phase` changes
  - [ ] 12.2 Clear streaming state on phase transition
  - [ ] 12.3 Show confirmation animation on phase completion
  - [ ] 12.4 Handle rapid phase transition edge case

- [ ] 13. Frontend: Error Handling and Recovery
  - [ ] 13.1 Add error boundary around SpecDocPane
  - [ ] 13.2 Implement retry action for failed document loads
  - [ ] 13.3 Preserve partial content on streaming interruption
  - [ ] 13.4 Add fallback to standard rendering if spec state inconsistent
  - [ ] 13.5 Log errors without crashing chat

- [ ] 14. Accessibility Compliance
  - [ ] 14.1 Add `aria-label` to SpecPlaceholder for document type
  - [ ] 14.2 Ensure "View in Sidebar" button has accessible name
  - [ ] 14.3 Add ARIA landmarks to SpecDocPane
  - [ ] 14.4 Implement focus management for tab navigation
  - [ ] 14.5 Test with screen reader (VoiceOver/NVDA)

- [ ] 15. Testing: Unit Tests
  - [ ] 15.1 Add tests for `shouldRenderInChat` function
  - [ ] 15.2 Add tests for `isSpecDocumentMessage` function
  - [ ] 15.3 Add tests for `detectSpecDocument` patterns
  - [ ] 15.4 Add tests for spec-store actions
  - [ ] 15.5 Add tests for SpecPhaseTabs keyboard navigation

- [ ] 16. Testing: Integration Tests
  - [ ] 16.1 Test SSE event handling with `spec_doc_update`
  - [ ] 16.2 Test document content updates in SpecDocPane
  - [ ] 16.3 Test phase transition flow
  - [ ] 16.4 Test sidebar-chat synchronization
  - [ ] 16.5 Test error recovery scenarios

- [ ] 17. Documentation
  - [ ] 17.1 Update API documentation with `spec_doc_update` event
  - [ ] 17.2 Add component usage examples in comments
  - [ ] 17.3 Document state management patterns
  - [ ] 17.4 Add troubleshooting guide for common issues

- [ ]* 18. Performance Optimization (Optional)
  - [ ]* 18.1 Add virtualized scrolling for large documents
  - [ ]* 18.2 Implement debounced updates during streaming
  - [ ]* 18.3 Add lazy loading for inactive phase tabs
  - [ ]* 18.4 Add memoization for parsed markdown

## Dependencies

- Task 1 → Task 5 (SSE event types needed for event handling)
- Task 2 → Task 3 (SpecWorkflowService needed in chat handler)
- Task 4 → Task 5 (State store needed for event handling)
- Task 6 → Task 10 (SpecDocPane component needed for layout)
- Task 8 → Task 9 (SpecPlaceholderRenderer needed for filtering)
- Task 9 → Task 10 (Message filtering needed before chat panel)
- Task 5, Task 4, Task 6, Task 8 → Task 10 (All components needed for integration)
- Task 10 → Task 11, Task 12, Task 13 (Layout integration before polish)

## Estimated Effort

| Phase | Tasks | Effort |
|-------|-------|--------|
| Backend Foundation | 1, 2, 3 | 2-3 days |
| Frontend State | 4, 5 | 1 day |
| UI Components | 6, 7, 8 | 2-3 days |
| Integration | 9, 10, 11, 12 | 2-3 days |
| Error Handling | 13 | 0.5 day |
| Accessibility | 14 | 0.5 day |
| Testing | 15, 16 | 2 days |
| Documentation | 17 | 0.5 day |
| **Total** | | **10-13 days** |
