import { Test, TestingModule } from '@nestjs/testing';
import { CustomloggerService } from './customlogger.service';

describe('CustomloggerService', () => {
  let service: CustomloggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomloggerService],
    }).compile();

    service = module.get<CustomloggerService>(CustomloggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
