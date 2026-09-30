export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf'];
export const FILE_ACCEPT = ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(',');

// أيقونة لكل امتداد، والباقي بياخد الأيقونة العامة
const FILE_ICONS: Record<string, string> = {
  pdf: 'picture_as_pdf',
  doc: 'article',
  docx: 'article',
  xls: 'table_chart',
  xlsx: 'table_chart',
};

export function iconByName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return FILE_ICONS[ext] ?? 'insert_drive_file';
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// بيرجع null لو الملف سليم، أو سبب الرفض
export function validateFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return 'نوع الملف غير مسموح، المسموح: صور (JPG, PNG) أو PDF';
  }
  if (file.size === 0) return 'الملف فارغ';

  return null;
}