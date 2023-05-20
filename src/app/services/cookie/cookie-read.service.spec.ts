import { TestBed } from '@angular/core/testing';

import { CookieReadService } from './cookie-read.service';

describe('CookieReadService', () => {
  let service: CookieReadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CookieReadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
