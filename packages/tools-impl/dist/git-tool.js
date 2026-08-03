import { execFile } from 'node:child_process';
import { z } from 'zod';
const gitExecInputSchema = z.object({
    args: z.array(z.string()).min(1),
    timeoutMs: z.number().int().positive().max(120_000).optional()
});
export class GitTool {
    schema = {
        name: 'git.exec',
        description: 'Execute a safe git command and return stdout/stderr.',
        risk: 'low',
        access: 'git',
        approval: 'never',
        input: {
            type: 'object',
            required: ['args'],
            properties: {
                args: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Git arguments list, for example: ["status", "--short"].'
                },
                timeoutMs: {
                    type: 'number',
                    description: 'Command timeout in milliseconds.'
                }
            }
        },
        output: {
            type: 'object',
            required: ['stdout', 'stderr', 'exitCode'],
            properties: {
                stdout: { type: 'string' },
                stderr: { type: 'string' },
                exitCode: { type: 'number' }
            }
        }
    };
    cwd;
    blockedSubcommands;
    constructor(options = {}) {
        this.cwd = options.cwd ?? process.cwd();
        this.blockedSubcommands = new Set((options.blockedSubcommands ?? [
            'add',
            'apply',
            'checkout',
            'clean',
            'commit',
            'merge',
            'pull',
            'push',
            'rebase',
            'reset',
            'restore',
            'switch',
        ])
            .map((value) => value.trim().toLowerCase())
            .filter(Boolean));
    }
    async execute(input) {
        const parsed = parseGitExecInput(input);
        const args = parsed.args;
        const subcommand = args[0]?.trim().toLowerCase();
        if (!subcommand) {
            throw new Error('Git subcommand is missing.');
        }
        if (this.blockedSubcommands.has(subcommand)) {
            throw new Error(`Blocked git subcommand: ${subcommand}`);
        }
        return runGit(args, {
            cwd: this.cwd,
            timeoutMs: parsed.timeoutMs ?? 20_000
        });
    }
}
function parseGitExecInput(input) {
    const result = gitExecInputSchema.safeParse(input);
    if (!result.success) {
        throw new Error(`Invalid git.exec input: ${result.error.message}`);
    }
    return result.data;
}
function runGit(args, options) {
    return new Promise((resolve, reject) => {
        const child = execFile('git', args, {
            cwd: options.cwd,
            timeout: options.timeoutMs,
            windowsHide: true
        }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve({
                stdout: stdout.trim(),
                stderr: stderr.trim(),
                exitCode: 0
            });
        });
        child.once('error', (error) => reject(error));
    });
}
