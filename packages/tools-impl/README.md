# @agent-flow/tools-impl

Builtin tool implementations that still run in-process for transitional usage.

## Scope

This package no longer provides local filesystem tools (`fs.read`, `fs.write`).
Filesystem and shell-like workspace operations are expected to run through `pkg/runner`
via runner tasks (`fs.read`, `fs.write`, `fs.patch`, `fs.list`, `fs.search`, `shell.exec`).

Current local tools in this package:

- `git.exec`
- `http.request`

## Usage

```ts
import { registerBuiltinTools } from '@agent-flow/tools-impl';
import { ToolRegistry } from '@agent-flow/core';

const registry = new ToolRegistry();
registerBuiltinTools(registry);
```
