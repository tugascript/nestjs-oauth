import { Test, TestingModule } from '@nestjs/testing';
import { LoadersService } from './loaders.service';

describe('LoadersService', () => {
  let service: LoadersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoadersService],
    }).compile();

    service = module.get<LoadersService>(LoadersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
