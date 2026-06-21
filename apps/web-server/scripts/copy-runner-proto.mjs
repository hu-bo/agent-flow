import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(scriptDir, '..');
const repoRoot = resolve(appDir, '..', '..');
const source = resolve(repoRoot, 'protocol', 'proto', 'runner.proto');
const target = resolve(appDir, 'dist', 'protocol', 'proto', 'runner.proto');

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
