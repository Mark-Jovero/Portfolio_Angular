import { TestBed } from '@angular/core/testing';

import { CookieDeleteService } from './cookie-delete.service';

describe('CookieDeleteService', () => {
  let service: CookieDeleteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CookieDeleteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
