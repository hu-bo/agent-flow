"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  createLogger: () => createLogger
});
module.exports = __toCommonJS(index_exports);
var import_node_fs = require("fs");
var import_node_path = __toESM(require("path"));
var import_node_stream = require("stream");
var import_pino = __toESM(require("pino"));
function toLocalDateLabel(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
var DailyFileStream = class extends import_node_stream.Writable {
  logDir;
  currentDate = "";
  stream = null;
  constructor(logDir) {
    super();
    this.logDir = import_node_path.default.resolve(logDir);
    (0, import_node_fs.mkdirSync)(this.logDir, { recursive: true });
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
    const filePath = import_node_path.default.join(this.logDir, `LLM-${dateLabel}.log`);
    this.stream = (0, import_node_fs.createWriteStream)(filePath, { flags: "a" });
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
  const destination = output === "pretty" ? import_pino.default.transport(createPrettyTransport()) : new DailyFileStream(logDir);
  const baseLogger = (0, import_pino.default)(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createLogger
});
