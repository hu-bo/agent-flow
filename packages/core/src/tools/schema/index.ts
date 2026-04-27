import type { JsonSchema } from '../../types/index.js';

function assertType(value: unknown, expected: NonNullable<JsonSchema['type']>, pointer: string): void {
  if (expected === 'array') {
    if (!Array.isArray(value)) {
      throw new Error(`Schema validation failed at "${pointer}": expected array.`);
    }
    return;
  }

  if (expected === 'object') {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new Error(`Schema validation failed at "${pointer}": expected object.`);
    }
    return;
  }

  if (typeof value !== expected) {
    throw new Error(`Schema validation failed at "${pointer}": expected ${expected}.`);
  }
}

export function validateAgainstSchema(value: unknown, schema: JsonSchema, pointer = '$'): void {
  if (schema.type) {
    assertType(value, schema.type, pointer);
  }

  if (schema.type === 'object') {
    const objectValue = value as Record<string, unknown>;
    for (const requiredKey of schema.required ?? []) {
      if (!(requiredKey in objectValue)) {
        throw new Error(`Schema validation failed at "${pointer}": missing required key "${requiredKey}".`);
      }
    }

    for (const [key, childSchema] of Object.entries(schema.properties ?? {})) {
      if (objectValue[key] === undefined) {
        continue;
      }
      validateAgainstSchema(objectValue[key], childSchema, `${pointer}.${key}`);
    }
  }

  if (schema.type === 'array' && schema.items) {
    const arrayValue = value as unknown[];
    arrayValue.forEach((item, index) => {
      validateAgainstSchema(item, schema.items as JsonSchema, `${pointer}[${index}]`);
    });
  }
}
