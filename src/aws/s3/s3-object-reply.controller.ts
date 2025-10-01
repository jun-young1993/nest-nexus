import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { S3ObjectReplyService } from './s3-object-reply.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { CreateS3ObjectReplyDto } from './dto/create-s3-object-reply.dto';
import { UpdateS3ObjectReplyDto } from './dto/update-s3-object-reply.dto';
import { S3ObjectReply } from './entities/s3-object-reply.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('S3 Object Replies')
@ApiBearerAuth()
@Controller('s3-object-replies')
@UseGuards(JwtAuthGuard)
export class S3ObjectReplyController {
  constructor(private readonly s3ObjectReplyService: S3ObjectReplyService) {}

  /**
   * S3 객체에 댓글을 추가합니다.
   */
  @Post('s3-object/:s3ObjectId')
  @ApiOperation({ summary: 'S3 객체에 댓글을 추가합니다.' })
  @ApiBody({ type: CreateS3ObjectReplyDto })
  @ApiResponse({
    status: 201,
    description: 'S3 객체에 댓글을 추가했습니다.',
    type: S3ObjectReply,
  })
  @HttpCode(HttpStatus.CREATED)
  async createReply(
    @Param('s3ObjectId') s3ObjectId: string,
    @Body() createS3ObjectReplyDto: CreateS3ObjectReplyDto,
    @CurrentUser() user: User,
  ) {
    return await this.s3ObjectReplyService.createReply(
      createS3ObjectReplyDto,
      user,
      s3ObjectId,
    );
  }

  /**
   * 특정 S3 객체의 댓글 목록을 조회합니다.
   */
  @Get('s3-object/:s3ObjectId')
  async getRepliesByS3ObjectId(@Param('s3ObjectId') s3ObjectId: string) {
    return await this.s3ObjectReplyService.getRepliesByS3ObjectId(s3ObjectId);
  }

  /**
   * 현재 사용자의 댓글 목록을 조회합니다.
   */
  @Get('my-replies')
  async getMyReplies(@CurrentUser('id') userId: string) {
    return await this.s3ObjectReplyService.getRepliesByUserId(userId);
  }

  /**
   * 특정 사용자의 댓글 목록을 조회합니다.
   */
  @Get('user/:userId')
  async getRepliesByUserId(@Param('userId') userId: string) {
    return await this.s3ObjectReplyService.getRepliesByUserId(userId);
  }

  /**
   * 댓글 ID로 댓글을 조회합니다.
   */
  @Get(':id')
  async getReplyById(@Param('id') id: string) {
    return await this.s3ObjectReplyService.getReplyById(id);
  }

  /**
   * 댓글을 수정합니다.
   */
  @Put(':id')
  async updateReply(
    @Param('id') id: string,
    @Body() updateS3ObjectReplyDto: UpdateS3ObjectReplyDto,
    @CurrentUser() user: User,
  ) {
    const userId = user.id;
    return await this.s3ObjectReplyService.updateReply(
      id,
      updateS3ObjectReplyDto,
      userId,
    );
  }

  /**
   * 댓글을 삭제합니다.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeReply(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    const userId = user.id;
    await this.s3ObjectReplyService.removeReply(id, userId);
  }

  /**
   * 특정 S3 객체의 댓글 개수를 조회합니다.
   */
  @Get('s3-object/:s3ObjectId/count')
  async getReplyCountByS3ObjectId(@Param('s3ObjectId') s3ObjectId: string) {
    const count =
      await this.s3ObjectReplyService.getReplyCountByS3ObjectId(s3ObjectId);
    return { count };
  }

  /**
   * 특정 S3 객체의 모든 댓글을 삭제합니다 (관리자용).
   */
  @Delete('s3-object/:s3ObjectId/all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAllRepliesByS3ObjectId(
    @Param('s3ObjectId') s3ObjectId: string,
  ): Promise<void> {
    await this.s3ObjectReplyService.removeAllRepliesByS3ObjectId(s3ObjectId);
  }

  /**
   * 특정 사용자의 모든 댓글을 삭제합니다 (관리자용).
   */
  @Delete('user/:userId/all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAllRepliesByUserId(
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.s3ObjectReplyService.removeAllRepliesByUserId(userId);
  }
}
