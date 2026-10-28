type DuplicateKeyError = {
  code: number;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
};

export function isDuplicateKeyError(err: unknown): err is DuplicateKeyError {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === 11000;
}

export function duplicateKeyIncludes(err: DuplicateKeyError, field: string): boolean {
  return Boolean(err.keyPattern && field in err.keyPattern) || Boolean(err.keyValue && field in err.keyValue);
}
