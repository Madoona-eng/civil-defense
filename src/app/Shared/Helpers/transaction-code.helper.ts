// Helpers/transaction-code.helper.ts
import { toArabicDigits } from './number.helper';

export function splitTransactionCode(code: string): string[] {
  return code.split('-').map((part) => toArabicDigits(part));
}