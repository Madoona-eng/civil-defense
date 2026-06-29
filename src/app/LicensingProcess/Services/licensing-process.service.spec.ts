import { TestBed } from '@angular/core/testing';

import { LicensingProcessService } from './licensing-process.service';

describe('LicensingProcessService', () => {
  let service: LicensingProcessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LicensingProcessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
