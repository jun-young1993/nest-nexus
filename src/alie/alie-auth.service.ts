import { Injectable } from '@nestjs/common';

@Injectable()
export class AlieAuthService {
  constructor() {}
  async callback() {
    return 'test';
  }

}
