import {Body, Controller, Get, Post, Query} from '@nestjs/common';

import {ApiOperation, ApiTags} from "@nestjs/swagger";
import { AlieAuthService } from './alie-auth.service';


@ApiTags('alie-auth')
@Controller('alie-auth')
export class AlieAuthController {
  constructor(private readonly alieAuthService: AlieAuthService) {}

  @Get('callback')
  @ApiOperation({ summary: `alie auth callback`} )
  async callback(@Query() query) {
    console.log("=>(alie-auth.controller.ts:16) query", query);
    return await this.alieAuthService.callback();
  }
  @Post('callback')
  @ApiOperation({ summary: `alie auth callback`} )
  async callback2(@Body() body) {
    console.log("=>(alie-auth.controller.ts:22) body", body);
    return await this.alieAuthService.callback();
  }

  @Get('authrization-code')
  @ApiOperation({ summary: `alie get AuthorizationCode`} )
  async getAuthorizationCode(){
	return await this.alieAuthService.getAuthorizationCode();
  }

  @Get('access-token')
  @ApiOperation({ summary: `alie get AuthorizationCode`} )
  async createAccessToken(){
    return await this.alieAuthService.createAccessToken();
  }
}
