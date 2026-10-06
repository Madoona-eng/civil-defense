// number.helper.ts
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicDigits(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '-';
  return String(value).replace(/\d/g, (d) => ARABIC_DIGITS[+d]);
}