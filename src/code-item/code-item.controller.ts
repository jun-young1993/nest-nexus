import { CodeItemService } from './code-item.service';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateCodeItemDto } from './dto/create-code-item.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CodeItem } from './entities/code-item.entity';

@ApiTags('code-item')
@Controller('code-item')
export class CodeItemController {
  constructor(private readonly codeItemService: CodeItemService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new code item' })
  @ApiResponse({
    status: 201,
    description: 'The code item has been successfully created.',
    type: CodeItem,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiBody({ type: CreateCodeItemDto })
  create(@Body() createCodeItemDto: CreateCodeItemDto) {
    return this.codeItemService.create(createCodeItemDto);
  }

  @Get(':code/:key')
  @ApiOperation({ summary: 'Retrieve a code item by code and key' })
  @ApiParam({
    name: 'code',
    description: 'The code associated with the Code entity',
  })
  @ApiParam({
    name: 'key',
    description: 'The key associated with the CodeItem entity',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the code item.',
    type: CodeItem,
  })
  @ApiResponse({ status: 404, description: 'Code or CodeItem not found.' })
  findOneByCodeAndKey(
    @Param('code') code: string,
    @Param('key') key: string,
  ): Promise<CodeItem> {
    return this.codeItemService.findOneByCodeAndKey(code, key);
  }
}
