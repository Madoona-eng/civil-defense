import { Pipe, PipeTransform } from '@angular/core';
import { toArabicDigits } from '../Helpers/number.helper';

@Pipe({ name: 'arDigits', standalone: true })
export class ArDigitsPipe implements PipeTransform {
  transform(value: string | number | null | undefined): string {
    return toArabicDigits(value);
  }
}