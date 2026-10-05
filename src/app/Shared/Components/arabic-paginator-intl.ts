import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class ArabicPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'عدد العناصر في الصفحة:';
  override nextPageLabel = 'الصفحة التالية';
  override previousPageLabel = 'الصفحة السابقة';
  override firstPageLabel = 'الصفحة الأولى';
  override lastPageLabel = 'الصفحة الأخيرة';

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0) {
      return 'لا توجد عناصر';
    }

    if (pageSize === 0) {
      return `عدد العناصر: ${this.toArabicNumber(length)}`;
    }

    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, length);

    return `عرض ${this.toArabicNumber(startIndex + 1)}–${this.toArabicNumber(endIndex)} من ${this.toArabicNumber(length)}`;
  };

  private toArabicNumber(value: number): string {
    return value.toLocaleString('ar-EG');
  }
}
