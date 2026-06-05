// src/index.ts
import { createWriteStream, mkdirSync } from "fs";
import path from "path";
import { Writable } from "stream";
import pino from "pino";
function toLocalDateLabel(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
var DailyFileStream = class extends Writable {
  logDir;
  currentDate = "";
  stream = null;
  constructor(logDir) {
    super();
    this.logDir = path.resolve(logDir);
    mkdirSync(this.logDir, { recursive: true });
  }
  ensureStream(now) {
    const dateLabel = toLocalDateLabel(now);
    if (this.stream && this.currentDate === dateLabel) {
      return this.stream;
    }
    if (this.stream) {
      this.stream.end();
      this.stream = null;
    }
    this.currentDate = dateLabel;
    const filePath = path.join(this.logDir, `LLM-${dateLabel}.log`);
    this.stream = createWriteStream(filePath, { flags: "a" });
    return this.stream;
  }
  _write(chunk, encoding, callback) {
    const stream = this.ensureStream(/* @__PURE__ */ new Date());
    stream.write(chunk, encoding, callback);
  }
  _final(callback) {
    if (!this.stream) {
      callback();
      return;
    }
    this.stream.end(callback);
    this.stream = null;
    this.currentDate = "";
  }
};
function createPrettyTransport() {
  return {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "yyyy-mm-dd HH:MM:ss",
      ignore: "pid,hostname"
    }
  };
}
function createLogger(service, options = {}) {
  if (!service) {
    throw new Error("service name is required for logger initialization");
  }
  const logLevel = options.logLevel ?? "info";
  const logDir = options.logDir ?? "logs";
  const output = options.output ?? "file";
  const envLabel = options.envLabel ?? "production";
  const destination = output === "pretty" ? pino.transport(createPrettyTransport()) : new DailyFileStream(logDir);
  const baseLogger = pino(
    {
      level: logLevel,
      base: {
        pid: process.pid,
        service,
        env: envLabel
      },
      timestamp: () => `,"time":"${(/* @__PURE__ */ new Date()).toISOString()}"`
    },
    destination
  );
  const originalChild = baseLogger.child.bind(baseLogger);
  function createScopedChild(scopeOrBindings) {
    if (typeof scopeOrBindings === "string") {
      return originalChild({ scope: scopeOrBindings });
    }
    return originalChild(scopeOrBindings);
  }
  baseLogger.child = createScopedChild;
  return baseLogger;
}
export {
  createLogger
};
