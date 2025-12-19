export function inferTitleLevel(text: string): number {
  if (/^\d+\.\d+\./.test(text)) return 2;
  if (/^\d+\./.test(text)) return 1;

  if (text.length < 20) return 1;
  if (text.length < 40) return 2;

  return 3;
}
