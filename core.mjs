export const MAX_PATTERN_LENGTH = 2_000;
export const MAX_TEXT_LENGTH = 200_000;
export const MAX_MATCHES = 1_000;

export function validateInput({ pattern, flags = '', text = '' }) {
  if (typeof pattern !== 'string' || pattern.length > MAX_PATTERN_LENGTH) {
    return 'Шаблон должен быть строкой длиной не более 2 000 символов.';
  }
  if (typeof flags !== 'string' || [...flags].some((flag) => !'dgimsuvy'.includes(flag))) {
    return 'Используй поддерживаемые флаги JavaScript: d, g, i, m, s, u, v, y.';
  }
  if (new Set(flags).size !== flags.length) return 'Флаги не должны повторяться.';
  if (flags.includes('u') && flags.includes('v')) return 'Флаги u и v нельзя использовать вместе.';
  if (typeof text !== 'string' || text.length > MAX_TEXT_LENGTH) {
    return 'Текст должен быть строкой длиной не более 200 000 символов.';
  }
  return null;
}

export function lineAndColumn(text, index) {
  const safeIndex = Math.max(0, Math.min(index, text.length));
  const lastBreak = text.lastIndexOf('\n', Math.max(0, safeIndex - 1));
  return { line: text.slice(0, safeIndex).split('\n').length, column: safeIndex - lastBreak };
}

export function formatReplacement(match) {
  const start = match.index;
  return `${start} (${match.line}:${match.column})`;
}
