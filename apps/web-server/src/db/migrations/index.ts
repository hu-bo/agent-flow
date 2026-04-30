import { InitModelConfig20260426000100 } from './20260426000100-init-model-config.js';
import { DropProviderModelCostMeta20260428000100 } from './20260428000100-drop-provider-model-cost-meta.js';
import { DropProviderModelCapabilities20260428000200 } from './20260428000200-drop-provider-model-capabilities.js';
import { InitUserAccount20260429000100 } from './20260429000100-init-user-account.js';
import { AlignUserAccountWithCasdoor20260429000200 } from './20260429000200-align-user-account-with-casdoor.js';
import { InitRunnerControlPlane20260429000300 } from './20260429000300-init-runner-control-plane.js';

export const migrations = [
  InitModelConfig20260426000100,
  DropProviderModelCostMeta20260428000100,
  DropProviderModelCapabilities20260428000200,
  InitUserAccount20260429000100,
  AlignUserAccountWithCasdoor20260429000200,
  InitRunnerControlPlane20260429000300,
];
