export function formatDateForApi(date: Date | null): string | undefined {
  if (!date) return undefined;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// "2026-09-30" -> Date محلي (من غير مشاكل الـ timezone)
export function parseDateFromApi(value: string | null | undefined): Date | null {
  if (!value) return null;

  const [year, month, day] = value.substring(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}