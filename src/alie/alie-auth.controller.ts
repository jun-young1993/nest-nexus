import {Body, Controller, Get, Post, Query} from '@nestjs/common';

import {ApiOperation, ApiTags} from "@nestjs/swagger";
import { AlieAuthService } from './alie-auth.service';
import { CallbackQueryDto } from './dto/callback-dto';


@ApiTags('alie-auth')
@Controller('alie-auth')
export class AlieAuthController {
  constructor(private readonly alieAuthService: AlieAuthService) {}

  @Get('callback')
  @ApiOperation({ summary: `alie auth callback`} )
  async callback(@Query() {code}: CallbackQueryDto) {
    console.log("=>(alie-auth.controller.ts:16) query code", code);
    return await this.alieAuthService.callback();
  }

  @Get('o-auth')
  @ApiOperation({ summary: `alie oAuth`} )
  async oAuth(){
    return await this.alieAuthService.oAuth();
  }



}
