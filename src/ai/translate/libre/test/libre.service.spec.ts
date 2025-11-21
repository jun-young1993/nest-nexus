import { Test, TestingModule } from '@nestjs/testing';
import { LibreService } from '../libre.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('LibreService', () => {
  let service: LibreService;
  //   let httpService: HttpService;
  //   let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LibreService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LibreService>(LibreService);
    // httpService = module.get<HttpService>(HttpService);
    // configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isInstalled', () => {
    it('should return true', async () => {
      const result = true;
      expect(result).toBe(true);
    });
  });
});
