import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { TokenUsage, UnifiedMessage } from '../messages/index.js';

export interface SessionMetadata {
  sessionId: string;
  userId: string;
  title: string;
  modelId: string;
  messageCount: number;
  tokenUsage: TokenUsage;
  createdAt: string;
  updatedAt: string;
  lastDeviceId: string;
  storageRef: string;
  compactBoundaryUuid: string | null;
}

export interface RemoteSessionManager {
  create(userId: string, modelId: string): Promise<SessionMetadata>;
  load(sessionId: string): Promise<{ metadata: SessionMetadata; messages: UnifiedMessage[] }>;
  appendMessages(sessionId: string, messages: UnifiedMessage[]): Promise<void>;
  updateMetadata(sessionId: string, updates: Partial<SessionMetadata>): Promise<void>;
  listByUser(userId: string, limit?: number, offset?: number): Promise<SessionMetadata[]>;
  delete(sessionId: string): Promise<void>;
}

interface FileRemoteSessionManagerOptions {
  basePath: string;
}

/** Local file-backed implementation that mimics remote session persistence APIs. */
export class FileRemoteSessionManager implements RemoteSessionManager {
  private readonly sessionsRoot: string;

  constructor(options: FileRemoteSessionManagerOptions) {
    this.sessionsRoot = path.join(options.basePath, 'remote-sessions');
  }

  async create(userId: string, modelId: string): Promise<SessionMetadata> {
    const sessionId = crypto.randomUUID();
    const now = new Date().toISOString();
    const metadata: SessionMetadata = {
      sessionId,
      userId,
      title: '',
      modelId,
      messageCount: 0,
      tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      createdAt: now,
      updatedAt: now,
      lastDeviceId: '',
      storageRef: `sessions/${userId}/${sessionId}.jsonl`,
      compactBoundaryUuid: null,
    };

    await this.ensureSessionDir(sessionId);
    await this.writeMetadata(metadata);
    await fs.writeFile(this.messagesPath(sessionId), '', 'utf-8');
    return metadata;
  }

  async load(sessionId: string): Promise<{ metadata: SessionMetadata; messages: UnifiedMessage[] }> {
    const metadata = await this.readMetadata(sessionId);
    const compactPath = this.compactMessagesPath(sessionId);
    const activePath = await this.exists(compactPath) ? compactPath : this.messagesPath(sessionId);
    const messages = await this.readMessages(activePath);
    return { metadata, messages };
  }

  async appendMessages(sessionId: string, messages: UnifiedMessage[]): Promise<void> {
    if (messages.length === 0) return;
    const metadata = await this.readMetadata(sessionId);
    const payload = `${messages.map((msg) => JSON.stringify(msg)).join('\n')}\n`;
    await fs.appendFile(this.messagesPath(sessionId), payload, 'utf-8');
    if (await this.exists(this.compactMessagesPath(sessionId))) {
      await fs.appendFile(this.compactMessagesPath(sessionId), payload, 'utf-8');
    }

    let promptTokens = metadata.tokenUsage.promptTokens;
    let completionTokens = metadata.tokenUsage.completionTokens;
    let totalTokens = metadata.tokenUsage.totalTokens;
    for (const msg of messages) {
      const usage = msg.metadata.tokenUsage;
      if (!usage) continue;
      promptTokens += usage.promptTokens;
      completionTokens += usage.completionTokens;
      totalTokens += usage.totalTokens;
    }

    await this.writeMetadata({
      ...metadata,
      messageCount: metadata.messageCount + messages.length,
      tokenUsage: { ...metadata.tokenUsage, promptTokens, completionTokens, totalTokens },
      updatedAt: new Date().toISOString(),
    });
  }

  async updateMetadata(sessionId: string, updates: Partial<SessionMetadata>): Promise<void> {
    const current = await this.readMetadata(sessionId);
    await this.writeMetadata({
      ...current,
      ...updates,
      sessionId: current.sessionId,
      userId: current.userId,
      updatedAt: updates.updatedAt ?? new Date().toISOString(),
    });
  }

  async listByUser(userId: string, limit = 50, offset = 0): Promise<SessionMetadata[]> {
    if (!(await this.exists(this.sessionsRoot))) {
      return [];
    }

    const entries = await fs.readdir(this.sessionsRoot, { withFileTypes: true });
    const all = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
          try {
            return await this.readMetadata(entry.name);
          } catch {
            return null;
          }
        }),
    );

    return all
      .filter((meta): meta is SessionMetadata => !!meta && meta.userId === userId)
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      .slice(offset, offset + limit);
  }

  async delete(sessionId: string): Promise<void> {
    await fs.rm(this.sessionDir(sessionId), { recursive: true, force: true });
  }

  async listMessages(
    sessionId: string,
    options: { afterUuid?: string; limit?: number } = {},
  ): Promise<UnifiedMessage[]> {
    const { messages } = await this.load(sessionId);
    const afterUuid = options.afterUuid;
    const limit = options.limit;

    let subset = messages;
    if (afterUuid) {
      const idx = messages.findIndex((msg) => msg.uuid === afterUuid);
      subset = idx >= 0 ? messages.slice(idx + 1) : messages;
    }

    if (typeof limit === 'number' && limit > 0) {
      subset = subset.slice(-limit);
    }
    return subset;
  }

  async writeCompactedMessages(
    sessionId: string,
    allMessages: UnifiedMessage[],
    compactBoundaryUuid: string | null,
  ): Promise<void> {
    await this.ensureSessionDir(sessionId);
    const payload = `${allMessages.map((msg) => JSON.stringify(msg)).join('\n')}\n`;
    await fs.writeFile(this.messagesPath(sessionId), payload, 'utf-8');
    await fs.writeFile(this.compactMessagesPath(sessionId), payload, 'utf-8');

    const metadata = await this.readMetadata(sessionId);
    await this.writeMetadata({
      ...metadata,
      compactBoundaryUuid,
      messageCount: allMessages.length,
      updatedAt: new Date().toISOString(),
    });
  }

  private sessionDir(sessionId: string): string {
    return path.join(this.sessionsRoot, sessionId);
  }

  private metadataPath(sessionId: string): string {
    return path.join(this.sessionDir(sessionId), 'metadata.json');
  }

  private messagesPath(sessionId: string): string {
    return path.join(this.sessionDir(sessionId), 'messages.jsonl');
  }

  private compactMessagesPath(sessionId: string): string {
    return path.join(this.sessionDir(sessionId), 'messages.compact.jsonl');
  }

  private async ensureSessionDir(sessionId: string): Promise<void> {
    await fs.mkdir(this.sessionDir(sessionId), { recursive: true });
  }

  private async readMetadata(sessionId: string): Promise<SessionMetadata> {
    const content = await fs.readFile(this.metadataPath(sessionId), 'utf-8');
    return JSON.parse(content) as SessionMetadata;
  }

  private async writeMetadata(metadata: SessionMetadata): Promise<void> {
    await this.ensureSessionDir(metadata.sessionId);
    await fs.writeFile(
      this.metadataPath(metadata.sessionId),
      JSON.stringify(metadata, null, 2),
      'utf-8',
    );
  }

  private async readMessages(filePath: string): Promise<UnifiedMessage[]> {
    if (!(await this.exists(filePath))) {
      return [];
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim().length > 0);
    const parsed: UnifiedMessage[] = [];
    for (const line of lines) {
      try {
        parsed.push(JSON.parse(line) as UnifiedMessage);
      } catch {
        // Skip malformed lines to keep session recoverable.
      }
    }
    return parsed;
  }

  private async exists(targetPath: string): Promise<boolean> {
    try {
      await fs.access(targetPath);
      return true;
    } catch {
      return false;
    }
  }
}
