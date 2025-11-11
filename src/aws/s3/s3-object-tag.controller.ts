import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseArrayPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { S3ObjectTagService } from './s3-object-tag.service';
import { CreateS3ObjectTagDto } from './dto/create-s3-object-tag.dto';
import { UpdateS3ObjectTagDto } from './dto/update-s3-object-tag.dto';
import { S3ObjectTag } from './entities/s3-object-tag.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('S3ObjectTag')
@ApiBearerAuth()
@Controller('s3-object-tags')
@UseGuards(JwtAuthGuard)
export class S3ObjectTagController {
  constructor(private readonly s3ObjectTagService: S3ObjectTagService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new S3ObjectTag' })
  @ApiResponse({
    status: 201,
    description: 'S3ObjectTag created successfully',
    type: S3ObjectTag,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - tag name already exists',
  })
  async create(
    @Body() createS3ObjectTagDto: CreateS3ObjectTagDto,
  ): Promise<S3ObjectTag> {
    return this.s3ObjectTagService.create(createS3ObjectTagDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all S3ObjectTags' })
  @ApiResponse({
    status: 200,
    description: 'List of all S3ObjectTags',
    type: [S3ObjectTag],
  })
  async findAll(): Promise<S3ObjectTag[]> {
    return this.s3ObjectTagService.findAll();
  }

  @Get('types')
  @ApiOperation({ summary: 'Get available tag types' })
  @ApiResponse({
    status: 200,
    description: 'List of available tag types',
    type: [String],
  })
  async getAvailableTypes(): Promise<string[]> {
    return this.s3ObjectTagService.getAvailableTypes();
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get S3ObjectTags by type' })
  @ApiResponse({
    status: 200,
    description: 'List of S3ObjectTags with specified type',
    type: [S3ObjectTag],
  })
  async findByType(@Param('type') type: string): Promise<S3ObjectTag[]> {
    return this.s3ObjectTagService.findByType(type);
  }

  @Get('by-ids')
  @ApiOperation({ summary: 'Get S3ObjectTags by IDs' })
  @ApiQuery({
    name: 'ids',
    description: 'Comma-separated list of tag IDs',
    type: String,
    example: 'uuid1,uuid2,uuid3',
  })
  @ApiResponse({
    status: 200,
    description: 'List of S3ObjectTags with specified IDs',
    type: [S3ObjectTag],
  })
  async findByIds(
    @Query('ids', new ParseArrayPipe({ items: String, separator: ',' }))
    ids: string[],
  ): Promise<S3ObjectTag[]> {
    return this.s3ObjectTagService.findByIds(ids);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get S3ObjectTag by ID' })
  @ApiResponse({
    status: 200,
    description: 'S3ObjectTag found',
    type: S3ObjectTag,
  })
  @ApiResponse({ status: 404, description: 'S3ObjectTag not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<S3ObjectTag> {
    return this.s3ObjectTagService.findOne(id);
  }

  @Get('by-name/:name')
  @ApiOperation({ summary: 'Get S3ObjectTag by name' })
  @ApiResponse({
    status: 200,
    description: 'S3ObjectTag found',
    type: S3ObjectTag,
  })
  @ApiResponse({ status: 404, description: 'S3ObjectTag not found' })
  async findByName(@Param('name') name: string): Promise<S3ObjectTag> {
    const tag = await this.s3ObjectTagService.findByName(name);
    if (!tag) {
      throw new NotFoundException(`S3ObjectTag with name '${name}' not found`);
    }
    return tag;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update S3ObjectTag' })
  @ApiResponse({
    status: 200,
    description: 'S3ObjectTag updated successfully',
    type: S3ObjectTag,
  })
  @ApiResponse({ status: 404, description: 'S3ObjectTag not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - tag name already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateS3ObjectTagDto: UpdateS3ObjectTagDto,
  ): Promise<S3ObjectTag> {
    return this.s3ObjectTagService.update(id, updateS3ObjectTagDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete S3ObjectTag' })
  @ApiResponse({ status: 200, description: 'S3ObjectTag deleted successfully' })
  @ApiResponse({ status: 404, description: 'S3ObjectTag not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - tag is associated with S3Objects',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.s3ObjectTagService.remove(id);
  }

  @Delete('multiple')
  @ApiOperation({ summary: 'Delete multiple S3ObjectTags' })
  @ApiQuery({
    name: 'ids',
    description: 'Comma-separated list of tag IDs to delete',
    type: String,
    example: 'uuid1,uuid2,uuid3',
  })
  @ApiResponse({
    status: 200,
    description: 'S3ObjectTags deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - some tags are associated with S3Objects',
  })
  async removeMultiple(
    @Query('ids', new ParseArrayPipe({ items: String, separator: ',' }))
    ids: string[],
  ): Promise<void> {
    return this.s3ObjectTagService.removeMultiple(ids);
  }

  @Post('create-or-find')
  @ApiOperation({ summary: 'Create or find S3ObjectTag' })
  @ApiResponse({
    status: 200,
    description: 'S3ObjectTag created or found',
    type: S3ObjectTag,
  })
  async createOrFind(
    @Body() createS3ObjectTagDto: CreateS3ObjectTagDto,
  ): Promise<S3ObjectTag> {
    return this.s3ObjectTagService.createOrFind(createS3ObjectTagDto);
  }

  @Post('create-or-void')
  @ApiOperation({ summary: 'Create S3ObjectTag or void if already exists' })
  @ApiResponse({
    status: 200,
    description: 'S3ObjectTag created successfully or null if already exists',
    schema: {
      oneOf: [{ $ref: '#/components/schemas/S3ObjectTag' }, { type: 'null' }],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  async createOrVoid(
    @Body() createS3ObjectTagDto: CreateS3ObjectTagDto,
  ): Promise<S3ObjectTag | null> {
    return this.s3ObjectTagService.createOrVoid(createS3ObjectTagDto);
  }
}
