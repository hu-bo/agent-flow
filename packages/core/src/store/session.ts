import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { JsonlSerializer } from './serializer.js';
import type { UnifiedMessage, SerializedMessage } from '../messages/index.js';

export interface SessionInfo {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  modelId: string;
  cwd: string;
  messageCount: number;
  systemPrompt?: string;
}

export class SessionManager {
  private serializer = new JsonlSerializer();

  constructor(private basePath: string) {}

  createSession(config: { modelId: string; cwd: string; systemPrompt?: string }): SessionInfo {
    const sessionId = crypto.randomUUID();
    const now = new Date().toISOString();
    const sessionDir = path.join(this.basePath, sessionId);

    fs.mkdirSync(sessionDir, { recursive: true });

    const info: SessionInfo = {
      sessionId,
      createdAt: now,
      updatedAt: now,
      modelId: config.modelId,
      cwd: config.cwd,
      messageCount: 0,
      systemPrompt: config.systemPrompt,
    };

    fs.writeFileSync(path.join(sessionDir, 'metadata.json'), JSON.stringify(info, null, 2));
    return info;
  }

  loadSession(sessionId: string): { info: SessionInfo; messages: UnifiedMessage[] } {
    const sessionDir = path.join(this.basePath, sessionId);
    const info: SessionInfo = JSON.parse(fs.readFileSync(path.join(sessionDir, 'metadata.json'), 'utf-8'));

    const messagesPath = path.join(sessionDir, 'messages.jsonl');
    let messages: UnifiedMessage[] = [];
    if (fs.existsSync(messagesPath)) {
      const content = fs.readFileSync(messagesPath, 'utf-8');
      messages = this.serializer.deserializeMany(content);
    }

    return { info, messages };
  }

  listSessions(): SessionInfo[] {
    if (!fs.existsSync(this.basePath)) return [];

    const entries = fs.readdirSync(this.basePath, { withFileTypes: true });
    const sessions: SessionInfo[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const metaPath = path.join(this.basePath, entry.name, 'metadata.json');
      if (!fs.existsSync(metaPath)) continue;
      sessions.push(JSON.parse(fs.readFileSync(metaPath, 'utf-8')));
    }

    return sessions;
  }

  deleteSession(sessionId: string): void {
    const sessionDir = path.join(this.basePath, sessionId);
    fs.rmSync(sessionDir, { recursive: true, force: true });
  }

  appendMessage(sessionId: string, message: UnifiedMessage, cwd: string): void {
    const sessionDir = path.join(this.basePath, sessionId);
    const messagesPath = path.join(sessionDir, 'messages.jsonl');

    const serialized: SerializedMessage = {
      ...message,
      sessionId,
      cwd,
      version: '1.0',
    };

    fs.appendFileSync(messagesPath, this.serializer.serialize(serialized) + '\n');

    // Update metadata
    const metaPath = path.join(sessionDir, 'metadata.json');
    const info: SessionInfo = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    info.messageCount++;
    info.updatedAt = new Date().toISOString();
    fs.writeFileSync(metaPath, JSON.stringify(info, null, 2));
  }
}


