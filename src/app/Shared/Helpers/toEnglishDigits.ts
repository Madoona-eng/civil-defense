// Shared/Helpers/number.helper.ts
export function toEnglishDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)) // العربية الهندية ٠-٩
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)); // الفارسية ۰-۹
}