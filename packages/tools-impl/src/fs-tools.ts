import { readFile, writeFile } from 'node:fs/promises';
import type { ToolDefinition, ToolSchema } from '@agent-flow/core';

export interface FileReadInput {
  path: string;
  encoding?: BufferEncoding;
  maxBytes?: number;
}

export interface FileReadOutput {
  path: string;
  size: number;
  content: string;
}

export interface FileWriteInput {
  path: string;
  content: string;
  encoding?: BufferEncoding;
}

export interface FileWriteOutput {
  path: string;
  writtenBytes: number;
}

export class FileReadTool implements ToolDefinition<FileReadInput, FileReadOutput> {
  readonly schema: ToolSchema = {
    name: 'fs.read',
    description: 'Read text content from a file.',
    input: {
      type: 'object',
      required: ['path'],
      properties: {
        path: {
          type: 'string',
          description: 'Absolute or relative file path.'
        },
        encoding: {
          type: 'string',
          description: 'Text encoding. Defaults to utf8.'
        },
        maxBytes: {
          type: 'number',
          description: 'Fail when file size exceeds this number.'
        }
      }
    },
    output: {
      type: 'object',
      required: ['path', 'size', 'content'],
      properties: {
        path: { type: 'string' },
        size: { type: 'number' },
        content: { type: 'string' }
      }
    }
  };

  async execute(input: FileReadInput): Promise<FileReadOutput> {
    if (!input.path) {
      throw new Error('Invalid input: "path" is required.');
    }

    const encoding = input.encoding ?? 'utf8';
    const content = await readFile(input.path, { encoding });
    const size = Buffer.byteLength(content, encoding);
    if (input.maxBytes !== undefined && size > input.maxBytes) {
      throw new Error(`File exceeds maxBytes (${size} > ${input.maxBytes}).`);
    }

    return {
      path: input.path,
      size,
      content
    };
  }
}

export class FileWriteTool implements ToolDefinition<FileWriteInput, FileWriteOutput> {
  readonly schema: ToolSchema = {
    name: 'fs.write',
    description: 'Write text content to a file.',
    input: {
      type: 'object',
      required: ['path', 'content'],
      properties: {
        path: {
          type: 'string',
          description: 'Absolute or relative file path.'
        },
        content: {
          type: 'string',
          description: 'Text payload to write.'
        },
        encoding: {
          type: 'string',
          description: 'Text encoding. Defaults to utf8.'
        }
      }
    },
    output: {
      type: 'object',
      required: ['path', 'writtenBytes'],
      properties: {
        path: { type: 'string' },
        writtenBytes: { type: 'number' }
      }
    }
  };

  async execute(input: FileWriteInput): Promise<FileWriteOutput> {
    if (!input.path) {
      throw new Error('Invalid input: "path" is required.');
    }
    if (typeof input.content !== 'string') {
      throw new Error('Invalid input: "content" must be a string.');
    }

    const encoding = input.encoding ?? 'utf8';
    await writeFile(input.path, input.content, { encoding });
    return {
      path: input.path,
      writtenBytes: Buffer.byteLength(input.content, encoding)
    };
  }
}
