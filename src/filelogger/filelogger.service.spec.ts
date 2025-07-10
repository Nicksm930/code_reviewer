import { Test, TestingModule } from '@nestjs/testing';
import { FileloggerService } from './filelogger.service';

describe('FileloggerService', () => {
  let service: FileloggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileloggerService],
    }).compile();

    service = module.get<FileloggerService>(FileloggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
