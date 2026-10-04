export function formatDateForApi(date: Date | null): string | undefined {
  if (!date) return undefined;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseDateFromApi(value: string | null | undefined): Date | null {
  if (!value) return null;

  const [year, month, day] = value.substring(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '-';

  const date =
    value instanceof Date
      ? value
      : /^\d{4}-\d{2}-\d{2}/.test(value)
        ? parseDateFromApi(value)
        : new Date(value);
  if (!date || isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '-';

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '-';

  return date.toLocaleString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
