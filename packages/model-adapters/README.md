# @agent-flow/model-adapters

Unified model adapter package.

This package defines the adapter standard itself (`./types`) and ships provider implementations:

- `@agent-flow/model-adapters/types`: canonical adapter protocol types
- `@agent-flow/model-adapters/ai-sdk`: generic adapter built on Vercel AI SDK
- `@agent-flow/model-adapters/openai`: OpenAI factory
- `@agent-flow/model-adapters/anthropic`: Anthropic factory
- `@agent-flow/model-adapters/local`: deterministic local adapter

`@agent-flow/core` should consume adapter contracts from this package instead of owning duplicate message/provider types.
