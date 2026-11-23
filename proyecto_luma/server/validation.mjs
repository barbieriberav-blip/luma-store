export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function requireValue(condition, message, status = 400) {
  if (!condition) throw new HttpError(status, message);
}

export function text(value, max, min = 0) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  requireValue(normalized.length >= min && normalized.length <= max, `Escribe un texto de ${min} a ${max} caracteres.`);
  return normalized;
}

export function integer(value, min = 1, max = 2147483647) {
  requireValue(Number.isSafeInteger(value) && value >= min && value <= max, 'La cantidad o el identificador no son válidos.');
  return value;
}
