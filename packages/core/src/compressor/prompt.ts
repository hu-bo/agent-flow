export const COMPACT_SYSTEM_PROMPT = `Your task is to create a detailed summary of the conversation so far.
This summary will replace the conversation history, so it must preserve ALL information
needed to continue the work without losing context.

Output the following sections:

1. **Primary Request and Intent** â€?What the user is trying to accomplish
2. **Key Technical Decisions** â€?Architecture choices, libraries, patterns decided
3. **Files and Code** â€?Files modified/created, with key code snippets verbatim
4. **Current State** â€?What was just completed, what's in progress
5. **Pending Tasks** â€?What still needs to be done
6. **Important Context** â€?Constraints, preferences, gotchas discovered

Be thorough. Losing information here means losing it forever.`;

