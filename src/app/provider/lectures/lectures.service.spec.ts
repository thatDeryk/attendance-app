import { TestBed } from '@angular/core/testing';

import { LecturesService } from './lectures.service';

describe('LecturesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LecturesService = TestBed.get(LecturesService);
    expect(service).toBeTruthy();
  });
});
