import * as fs from 'fs';
import * as path from 'path';
import type { Checkpoint } from './checkpoint';

/** Local file-based checkpoint manager */
export class LocalCheckpointManager {
  constructor(private basePath: string) {}

  async save(checkpoint: Checkpoint): Promise<void> {
    const sessionDir = path.join(this.basePath, checkpoint.sessionId);
    fs.mkdirSync(sessionDir, { recursive: true });

    const filename = `${checkpoint.timestamp}.checkpoint`;
    const tmpPath = path.join(sessionDir, `${filename}.tmp`);
    const finalPath = path.join(sessionDir, `${filename}.json`);

    fs.writeFileSync(tmpPath, JSON.stringify(checkpoint, null, 2), 'utf-8');
    fs.renameSync(tmpPath, finalPath);
  }

  async loadLatest(sessionId: string): Promise<Checkpoint | null> {
    const sessionDir = path.join(this.basePath, sessionId);

    if (!fs.existsSync(sessionDir)) return null;

    const files = fs.readdirSync(sessionDir)
      .filter(f => f.endsWith('.checkpoint.json'))
      .sort();

    if (files.length === 0) return null;

    const latest = fs.readFileSync(path.join(sessionDir, files[files.length - 1]), 'utf-8');
    return JSON.parse(latest) as Checkpoint;
  }

  async prune(sessionId: string, keepCount: number = 5): Promise<void> {
    const sessionDir = path.join(this.basePath, sessionId);

    if (!fs.existsSync(sessionDir)) return;

    const files = fs.readdirSync(sessionDir)
      .filter(f => f.endsWith('.checkpoint.json'))
      .sort();

    const toDelete = files.slice(0, Math.max(0, files.length - keepCount));
    for (const file of toDelete) {
      fs.unlinkSync(path.join(sessionDir, file));
    }
  }
}
