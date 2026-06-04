import { AuditLogEntity } from './audit-log.entity.js';
import { ChatMessageEntity } from './chat-message.entity.js';
import { ChatSessionEntity } from './chat-session.entity.js';
import { CoreRuntimeCheckpointEntity } from './core-runtime-checkpoint.entity.js';
import { CoreRuntimeReplayEntity } from './core-runtime-replay.entity.js';
import { CoreRuntimeSessionEntity } from './core-runtime-session.entity.js';
import { ModelProfileEntity } from './model-profile.entity.js';
import { ProjectEntity } from './project.entity.js';
import { ProviderCredentialEntity } from './provider-credential.entity.js';
import { ProviderModelEntity } from './provider-model.entity.js';
import { ProviderEntity } from './provider.entity.js';
import { RunnerEntity } from './runner.entity.js';
import { RunnerTokenEntity } from './runner-token.entity.js';
import { RoutingPolicyEntity } from './routing-policy.entity.js';
import { UserEntity } from './user.entity.js';

export const entities = [
  ProviderEntity,
  ProviderCredentialEntity,
  ProviderModelEntity,
  ModelProfileEntity,
  RoutingPolicyEntity,
  AuditLogEntity,
  UserEntity,
  RunnerTokenEntity,
  RunnerEntity,
  ProjectEntity,
  ChatSessionEntity,
  ChatMessageEntity,
  CoreRuntimeSessionEntity,
  CoreRuntimeCheckpointEntity,
  CoreRuntimeReplayEntity,
];
