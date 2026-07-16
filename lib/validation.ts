export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!/^[\d\s+-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 12;
}
