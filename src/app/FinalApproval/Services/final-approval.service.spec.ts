import { TestBed } from '@angular/core/testing';

import { FinalApprovalService } from './final-approval.service';

describe('FinalApprovalService', () => {
  let service: FinalApprovalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinalApprovalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
