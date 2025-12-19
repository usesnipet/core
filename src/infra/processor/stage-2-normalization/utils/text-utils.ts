export function normalizeTextContent(text: string): string {
  return text
    .normalize('NFC')
    .replace(/\u00AD/g, '') // soft hyphen
    .replace(/\s+/g, ' ')
    .replace(/\r\n/g, '\n')
    .trim();
}
