import { TestBed } from '@angular/core/testing';

import { RequestingEntityService } from './requesting-entity.service';

describe('RequestingEntityService', () => {
  let service: RequestingEntityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestingEntityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
