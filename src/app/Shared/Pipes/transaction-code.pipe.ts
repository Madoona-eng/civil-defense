import { Pipe, PipeTransform } from '@angular/core';
import { splitTransactionCode } from '../Helpers/transaction-code.helper';

@Pipe({ name: 'transactionCode', standalone: true })
export class TransactionCodePipe implements PipeTransform {
  transform(value: string): string[] {
    return splitTransactionCode(value);
  }
}
