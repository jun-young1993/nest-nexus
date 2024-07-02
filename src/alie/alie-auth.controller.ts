import {Controller, Get} from '@nestjs/common';

import {ApiOperation, ApiTags} from "@nestjs/swagger";
import { AlieAuthService } from './alie-auth.service';


@ApiTags('alie-auth')
@Controller('alie-auth')
export class AlieAuthController {
  constructor(private readonly alieService: AlieAuthService) {}

  @Get('callback')
  @ApiOperation({ summary: `alie auth callback`} )
  async callback() {
	console.log('in callback');
    return await this.alieService.callback();
  }
}
