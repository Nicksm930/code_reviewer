import { Test, TestingModule } from '@nestjs/testing';
import { ReviewCacheService } from './review-cache.service';

describe('ReviewCacheService', () => {
  let service: ReviewCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewCacheService],
    }).compile();

    service = module.get<ReviewCacheService>(ReviewCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
