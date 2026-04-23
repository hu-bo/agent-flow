import type { ModelGateway } from '@agent-flow/model-gateway';

export interface ServerConfig {
  port: number;
  host?: string;
  gateway: ModelGateway;
  sessionDir: string;
  checkpointDir: string;
  corsOrigins?: string[];
  /** Path to static files directory (e.g. playground dist/) to serve in production */
  staticDir?: string;
}

