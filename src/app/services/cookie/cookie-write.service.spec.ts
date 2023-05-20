import { TestBed } from '@angular/core/testing';

import { CookieWriteService } from './cookie-write.service';

describe('CookieWriteService', () => {
  let service: CookieWriteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CookieWriteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
