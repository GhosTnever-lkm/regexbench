import { MAX_MATCHES, MAX_PATTERN_LENGTH, MAX_TEXT_LENGTH } from './core.mjs';

self.onmessage = ({ data }) => {
  const { id, pattern, flags, text, replacement } = data;
  try {
    if (typeof pattern !== 'string' || pattern.length > MAX_PATTERN_LENGTH || text.length > MAX_TEXT_LENGTH || typeof replacement !== 'string' || replacement.length > MAX_TEXT_LENGTH) {
      throw new Error('Превышен лимит размера шаблона или текста.');
    }
    if ([...flags].some((flag) => !'dgimsuvy'.includes(flag)) || new Set(flags).size !== flags.length || (flags.includes('u') && flags.includes('v'))) {
      throw new Error('Проверьте флаги регулярного выражения.');
    }
    // Add g only to scan every match; keep the user's sticky flag semantics.
    const scanFlags = flags.includes('g') || flags.includes('y') ? flags : `${flags}g`;
    const regex = new RegExp(pattern, scanFlags);
    const replacementRegex = new RegExp(pattern, flags);
    const lineStarts = [0];
    for (let i = 0; i < text.length; i += 1) if (text.charCodeAt(i) === 10) lineStarts.push(i + 1);
    const matches = [];
    let capped = false;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (matches.length >= MAX_MATCHES) {
        capped = true;
        break;
      }
      let low = 0;
      let high = lineStarts.length;
      while (low + 1 < high) {
        const mid = (low + high) >>> 1;
        if (lineStarts[mid] <= match.index) low = mid;
        else high = mid;
      }
      const line = low + 1;
      const column = match.index - lineStarts[low] + 1;
      matches.push({ index: match.index, line, column, value: match[0], groups: match.slice(1), namedGroups: match.groups ?? null });
      // RegExp.exec advances after empty matches for Unicode mode only. Advance explicitly otherwise.
      if (match[0] === '') {
        const point = text.codePointAt(regex.lastIndex);
        regex.lastIndex += scanFlags.includes('u') || scanFlags.includes('v')
          ? (point !== undefined && point > 0xffff ? 2 : 1)
          : 1;
      }
    }
    let preview = text.replace(replacementRegex, replacement);
    const truncated = preview.length > MAX_TEXT_LENGTH;
    if (truncated) preview = preview.slice(0, MAX_TEXT_LENGTH);
    self.postMessage({ id, ok: true, matches, preview, truncated, capped });
  } catch (error) {
    self.postMessage({ id, ok: false, error: error instanceof Error ? error.message : 'Ошибка регулярного выражения.' });
  }
};
