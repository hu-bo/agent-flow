import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import type { handleBidiStreamingCall, handleServerStreamingCall, handleUnaryCall, UntypedServiceImplementation } from "@grpc/grpc-js";
export declare const protobufPackage = "agentflow.runner.v1";
export declare enum Engine {
    ENGINE_UNSPECIFIED = 0,
    ENGINE_HOST = 1,
    ENGINE_DOCKER = 2,
    UNRECOGNIZED = -1
}
export declare function engineFromJSON(object: any): Engine;
export declare function engineToJSON(object: Engine): string;
export declare enum TaskEventType {
    TASK_EVENT_TYPE_UNSPECIFIED = 0,
    TASK_EVENT_TYPE_STARTED = 1,
    TASK_EVENT_TYPE_STDOUT = 2,
    TASK_EVENT_TYPE_STDERR = 3,
    TASK_EVENT_TYPE_PROGRESS = 4,
    TASK_EVENT_TYPE_RESULT = 5,
    TASK_EVENT_TYPE_ERROR = 6,
    TASK_EVENT_TYPE_COMPLETED = 7,
    TASK_EVENT_TYPE_HEARTBEAT = 8,
    UNRECOGNIZED = -1
}
export declare function taskEventTypeFromJSON(object: any): TaskEventType;
export declare function taskEventTypeToJSON(object: TaskEventType): string;
export declare enum ExecutionState {
    EXECUTION_STATE_UNSPECIFIED = 0,
    EXECUTION_STATE_ACCEPTED = 1,
    EXECUTION_STATE_RUNNING = 2,
    EXECUTION_STATE_TERMINAL = 3,
    UNRECOGNIZED = -1
}
export declare function executionStateFromJSON(object: any): ExecutionState;
export declare function executionStateToJSON(object: ExecutionState): string;
export declare enum TerminalStatus {
    TERMINAL_STATUS_UNSPECIFIED = 0,
    TERMINAL_STATUS_SUCCEEDED = 1,
    TERMINAL_STATUS_FAILED = 2,
    TERMINAL_STATUS_CANCELLED = 3,
    TERMINAL_STATUS_TIMED_OUT = 4,
    TERMINAL_STATUS_REJECTED = 5,
    UNRECOGNIZED = -1
}
export declare function terminalStatusFromJSON(object: any): TerminalStatus;
export declare function terminalStatusToJSON(object: TerminalStatus): string;
export declare enum FailureType {
    FAILURE_TYPE_UNSPECIFIED = 0,
    FAILURE_TYPE_VALIDATION = 1,
    FAILURE_TYPE_POLICY = 2,
    FAILURE_TYPE_PROCESS_START = 3,
    FAILURE_TYPE_PROCESS_EXIT = 4,
    FAILURE_TYPE_TIMEOUT = 5,
    FAILURE_TYPE_CANCELLED = 6,
    FAILURE_TYPE_OUTPUT_LIMIT = 7,
    FAILURE_TYPE_RESOURCE_EXHAUSTED = 8,
    FAILURE_TYPE_INTERNAL = 9,
    UNRECOGNIZED = -1
}
export declare function failureTypeFromJSON(object: any): FailureType;
export declare function failureTypeToJSON(object: FailureType): string;
export declare enum IsolationLevel {
    ISOLATION_LEVEL_UNSPECIFIED = 0,
    ISOLATION_LEVEL_GUARDED_HOST = 1,
    ISOLATION_LEVEL_CONTAINER = 2,
    ISOLATION_LEVEL_OS_SANDBOX = 3,
    UNRECOGNIZED = -1
}
export declare function isolationLevelFromJSON(object: any): IsolationLevel;
export declare function isolationLevelToJSON(object: IsolationLevel): string;
export interface TaskRequest {
    taskId: string;
    sessionId: string;
    stepId: string;
    command: string;
    args: string[];
    env: {
        [key: string]: string;
    };
    workingDir: string;
    timeoutMs: number;
    stream: boolean;
    authToken: string;
    inputJson: Buffer;
    engine: Engine;
    sandboxPolicy: SandboxPolicy | undefined;
    docker: DockerSpec | undefined;
    executionId: string;
    attempt: number;
    deadline: string;
    maxOutputBytes: number;
    resumeFromEventSequence: number;
}
export interface TaskRequest_EnvEntry {
    key: string;
    value: string;
}
export interface SandboxPolicy {
    enabled: boolean;
    readOnly: boolean;
    allowNetwork: boolean;
    allowedWorkingDirs: string[];
    allowedReadPaths: string[];
    allowedWritePaths: string[];
    blockedCommandFragments: string[];
    allowedEnvKeys: string[];
    deniedEnvKeys: string[];
}
export interface DockerMount {
    source: string;
    target: string;
    readOnly: boolean;
}
export interface DockerSpec {
    image: string;
    workDir: string;
    user: string;
    networkDisabled: boolean;
    readOnlyRootFs: boolean;
    mounts: DockerMount[];
    cpuLimitMillis: number;
    memoryLimitBytes: number;
    pidsLimit: number;
    diskLimitBytes: number;
}
export interface CancelTaskRequest {
    taskId: string;
    reason: string;
    executionId: string;
    attempt: number;
}
export interface CancelTaskResponse {
    accepted: boolean;
    message: string;
    state: ExecutionState;
}
export interface DispatchAck {
    taskId: string;
    executionId: string;
    attempt: number;
    accepted: boolean;
    state: ExecutionState;
    message: string;
    lastEventSequence: number;
}
export interface CancelAck {
    taskId: string;
    executionId: string;
    attempt: number;
    accepted: boolean;
    state: ExecutionState;
    message: string;
}
export interface EventAck {
    executionId: string;
    attempt: number;
    eventSequence: number;
}
export interface HealthCheckRequest {
}
export interface HealthCheckResponse {
    status: string;
    version: string;
    unixTime: number;
}
export interface StartedPayload {
    message: string;
}
export interface StreamPayload {
    chunk: string;
    chunkSequence: number;
    byteOffset: number;
    truncated: boolean;
}
export interface ProgressPayload {
    message: string;
    percent: number;
}
export interface ResultPayload {
    exitCode: number;
    outputJson: Buffer;
    stdoutBytes: number;
    stderrBytes: number;
    outputTruncated: boolean;
}
export interface ErrorPayload {
    message: string;
    retryable: boolean;
    failureType: FailureType;
    code: string;
}
export interface CompletedPayload {
    exitCode: number;
    durationMs: number;
    status: TerminalStatus;
    failureType: FailureType;
    message: string;
    stdoutBytes: number;
    stderrBytes: number;
    outputTruncated: boolean;
}
export interface HeartbeatPayload {
    message: string;
}
export interface TaskEvent {
    taskId: string;
    sessionId: string;
    stepId: string;
    type: TaskEventType;
    timestamp: string;
    runnerId: string;
    executionId: string;
    attempt: number;
    eventSequence: number;
    started?: StartedPayload | undefined;
    stdout?: StreamPayload | undefined;
    stderr?: StreamPayload | undefined;
    progress?: ProgressPayload | undefined;
    result?: ResultPayload | undefined;
    error?: ErrorPayload | undefined;
    completed?: CompletedPayload | undefined;
    heartbeat?: HeartbeatPayload | undefined;
}
export interface ConnectRegister {
    runnerToken: string;
    runnerId: string;
    kind: string;
    host: string;
    version: string;
    capabilities: string[];
    hostName: string;
    hostIp: string;
    os: string;
    arch: string;
    defaultShell: string;
    pathSeparator: string;
    lineEnding: string;
    workspaceRoots: string[];
    availableCommands: string[];
    capabilitySchemaVersion: number;
    isolationLevel: IsolationLevel;
    availableEngines: Engine[];
    logicalCpuCount: number;
    memoryBytes: number;
    maxConcurrentTasks: number;
    activeTasks: number;
}
export interface ConnectRegisterAck {
    runnerId: string;
    status: string;
    heartbeatIntervalMs: number;
    serverTime: string;
}
export interface ConnectHeartbeat {
    runnerId: string;
    runnerToken: string;
    timestamp: string;
    activeTasks: number;
    maxConcurrentTasks: number;
}
export interface ServerPing {
    serverTime: string;
}
export interface RunnerEnvelope {
    register?: ConnectRegister | undefined;
    heartbeat?: ConnectHeartbeat | undefined;
    taskEvent?: TaskEvent | undefined;
    dispatchAck?: DispatchAck | undefined;
    cancelAck?: CancelAck | undefined;
}
export interface ServerEnvelope {
    registerAck?: ConnectRegisterAck | undefined;
    runTask?: TaskRequest | undefined;
    cancelTask?: CancelTaskRequest | undefined;
    ping?: ServerPing | undefined;
    eventAck?: EventAck | undefined;
}
export declare const TaskRequest: MessageFns<TaskRequest>;
export declare const TaskRequest_EnvEntry: MessageFns<TaskRequest_EnvEntry>;
export declare const SandboxPolicy: MessageFns<SandboxPolicy>;
export declare const DockerMount: MessageFns<DockerMount>;
export declare const DockerSpec: MessageFns<DockerSpec>;
export declare const CancelTaskRequest: MessageFns<CancelTaskRequest>;
export declare const CancelTaskResponse: MessageFns<CancelTaskResponse>;
export declare const DispatchAck: MessageFns<DispatchAck>;
export declare const CancelAck: MessageFns<CancelAck>;
export declare const EventAck: MessageFns<EventAck>;
export declare const HealthCheckRequest: MessageFns<HealthCheckRequest>;
export declare const HealthCheckResponse: MessageFns<HealthCheckResponse>;
export declare const StartedPayload: MessageFns<StartedPayload>;
export declare const StreamPayload: MessageFns<StreamPayload>;
export declare const ProgressPayload: MessageFns<ProgressPayload>;
export declare const ResultPayload: MessageFns<ResultPayload>;
export declare const ErrorPayload: MessageFns<ErrorPayload>;
export declare const CompletedPayload: MessageFns<CompletedPayload>;
export declare const HeartbeatPayload: MessageFns<HeartbeatPayload>;
export declare const TaskEvent: MessageFns<TaskEvent>;
export declare const ConnectRegister: MessageFns<ConnectRegister>;
export declare const ConnectRegisterAck: MessageFns<ConnectRegisterAck>;
export declare const ConnectHeartbeat: MessageFns<ConnectHeartbeat>;
export declare const ServerPing: MessageFns<ServerPing>;
export declare const RunnerEnvelope: MessageFns<RunnerEnvelope>;
export declare const ServerEnvelope: MessageFns<ServerEnvelope>;
export type RunnerServiceService = typeof RunnerServiceService;
export declare const RunnerServiceService: {
    readonly connect: {
        readonly path: "/agentflow.runner.v1.RunnerService/Connect";
        readonly requestStream: true;
        readonly responseStream: true;
        readonly requestSerialize: (value: RunnerEnvelope) => Buffer;
        readonly requestDeserialize: (value: Buffer) => RunnerEnvelope;
        readonly responseSerialize: (value: ServerEnvelope) => Buffer;
        readonly responseDeserialize: (value: Buffer) => ServerEnvelope;
    };
    readonly runTask: {
        readonly path: "/agentflow.runner.v1.RunnerService/RunTask";
        readonly requestStream: false;
        readonly responseStream: true;
        readonly requestSerialize: (value: TaskRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => TaskRequest;
        readonly responseSerialize: (value: TaskEvent) => Buffer;
        readonly responseDeserialize: (value: Buffer) => TaskEvent;
    };
    readonly cancelTask: {
        readonly path: "/agentflow.runner.v1.RunnerService/CancelTask";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: CancelTaskRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => CancelTaskRequest;
        readonly responseSerialize: (value: CancelTaskResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => CancelTaskResponse;
    };
    readonly healthCheck: {
        readonly path: "/agentflow.runner.v1.RunnerService/HealthCheck";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: HealthCheckRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => HealthCheckRequest;
        readonly responseSerialize: (value: HealthCheckResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => HealthCheckResponse;
    };
};
export interface RunnerServiceServer extends UntypedServiceImplementation {
    connect: handleBidiStreamingCall<RunnerEnvelope, ServerEnvelope>;
    runTask: handleServerStreamingCall<TaskRequest, TaskEvent>;
    cancelTask: handleUnaryCall<CancelTaskRequest, CancelTaskResponse>;
    healthCheck: handleUnaryCall<HealthCheckRequest, HealthCheckResponse>;
}
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export interface MessageFns<T> {
    encode(message: T, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): T;
    fromJSON(object: any): T;
    toJSON(message: T): unknown;
    create(base?: DeepPartial<T>): T;
    fromPartial(object: DeepPartial<T>): T;
}
export {};
//# sourceMappingURL=runner.d.ts.map