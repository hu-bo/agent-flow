import * as crypto from 'crypto';
import { Agent } from './agent.js';
import { ToolRegistry } from './tool-registry.js';
import { PermissionManager } from './permission.js';
export class AgentTeam {
    teamConfig;
    deps;
    agents = [];
    currentIndex = 0;
    constructor(teamConfig, deps) {
        this.teamConfig = teamConfig;
        this.deps = deps;
        for (const agentConfig of teamConfig.agents) {
            const queryEngine = deps.queryEngineFactory(agentConfig.modelId);
            const agent = new Agent(queryEngine, agentConfig, {
                contextStore: deps.contextStore,
                toolRegistry: deps.toolRegistry,
                compressor: deps.compressor,
                checkpointManager: deps.checkpointManager,
                permissionManager: deps.permissionManager,
            });
            this.agents.push({ agent, config: agentConfig });
        }
    }
    async *run(task) {
        const maxRounds = this.teamConfig.maxRounds ?? 10;
        switch (this.teamConfig.strategy) {
            case 'round-robin':
                yield* this.runRoundRobin(task, maxRounds);
                break;
            case 'router':
                yield* this.runRouter(task);
                break;
            case 'hierarchical':
                yield* this.runHierarchical(task, maxRounds);
                break;
        }
    }
    async *runRoundRobin(task, maxRounds) {
        let currentMessage = task;
        for (let round = 0; round < maxRounds; round++) {
            const { agent, config } = this.agents[this.currentIndex % this.agents.length];
            this.currentIndex++;
            const prefixedMessage = `[Team Round ${round + 1}, Agent: ${config.role}]\n${currentMessage}`;
            let lastText = '';
            for await (const message of agent.run(prefixedMessage)) {
                yield message;
                const textParts = message.content.filter(p => p.type === 'text');
                if (textParts.length > 0) {
                    lastText = textParts[textParts.length - 1].text;
                }
            }
            // If the last agent's response doesn't contain tool calls, we're done
            if (!lastText.includes('[CONTINUE]'))
                break;
            currentMessage = lastText;
        }
    }
    async *runRouter(task) {
        // Route to the best-matching agent based on capabilities
        const selectedAgent = this.selectAgent(task);
        yield* selectedAgent.agent.run(task);
    }
    async *runHierarchical(task, maxRounds) {
        // First agent is the coordinator
        const coordinator = this.agents[0];
        const workers = this.agents.slice(1);
        if (workers.length === 0) {
            yield* coordinator.agent.run(task);
            return;
        }
        // Coordinator plans, workers execute
        const planPrompt = `You are a team coordinator. Plan how to accomplish this task and delegate to workers.\nWorkers available: ${workers.map(w => w.config.role).join(', ')}\n\nTask: ${task}`;
        for await (const message of coordinator.agent.run(planPrompt)) {
            yield message;
        }
        // Each worker executes their part
        for (let round = 0; round < maxRounds && round < workers.length; round++) {
            const worker = workers[round];
            const workerPrompt = `[Assigned by coordinator] Execute your part of the task: ${task}`;
            for await (const message of worker.agent.run(workerPrompt)) {
                yield message;
            }
        }
    }
    selectAgent(task) {
        const taskLower = task.toLowerCase();
        // Simple keyword matching against agent capabilities
        for (const entry of this.agents) {
            if (entry.config.capabilities?.some(cap => taskLower.includes(cap.toLowerCase()))) {
                return entry;
            }
        }
        return this.agents[0]; // default to first agent
    }
}
//# sourceMappingURL=team.js.map