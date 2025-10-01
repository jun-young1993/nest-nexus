import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { S3ObjectLikeService } from './s3-object-like.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { CreateS3ObjectLikeDto } from './dto/create-s3-object-like.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { S3ObjectLike } from './entities/s3-object-like.entity';

@ApiTags('S3 Object Likes')
@ApiBearerAuth()
@Controller('s3-object-likes')
@UseGuards(JwtAuthGuard)
export class S3ObjectLikeController {
  constructor(private readonly s3ObjectLikeService: S3ObjectLikeService) {}

  /**
   * S3 객체에 좋아요를 추가합니다.
   */
  @Post('s3-object/:s3ObjectId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'S3 객체에 좋아요를 추가합니다.' })
  @ApiResponse({
    status: 201,
    description: 'S3 객체에 좋아요를 추가했습니다.',
    type: S3ObjectLike,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async createLike(
    @Param('s3ObjectId') s3ObjectId: string,
    @CurrentUser() user: User,
  ) {
    return await this.s3ObjectLikeService.createLike(
      CreateS3ObjectLikeDto.fromJson({
        s3ObjectId,
      }),
      user,
    );
  }

  @Delete(':likeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeLikeById(
    @Param('likeId') likeId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.s3ObjectLikeService.removeLikeById(likeId, user);
  }

  /**
   * 특정 S3 객체의 좋아요를 취소합니다.
   */
  @Delete('s3-object/:s3ObjectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeLikeByObjectId(
    @Param('s3ObjectId') s3ObjectId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.s3ObjectLikeService.removeLike(s3ObjectId, user.id);
  }

  /**
   * 특정 S3 객체의 좋아요 목록을 조회합니다.
   */
  @Get('s3-object/:s3ObjectId')
  async getLikesByS3ObjectId(@Param('s3ObjectId') s3ObjectId: string) {
    return await this.s3ObjectLikeService.getLikesByS3ObjectId(s3ObjectId);
  }

  /**
   * 현재 사용자의 좋아요 목록을 조회합니다.
   */
  @Get('my-likes')
  async getMyLikes(@CurrentUser() user: User) {
    return await this.s3ObjectLikeService.getLikesByUserId(user.id);
  }

  /**
   * 특정 사용자의 좋아요 목록을 조회합니다.
   */
  @Get('user/:userId')
  async getLikesByUserId(@Param('userId') userId: string) {
    return await this.s3ObjectLikeService.getLikesByUserId(userId);
  }

  /**
   * 특정 S3 객체의 좋아요 개수를 조회합니다.
   */
  @Get('s3-object/:s3ObjectId/count')
  async getLikeCountByS3ObjectId(@Param('s3ObjectId') s3ObjectId: string) {
    const count =
      await this.s3ObjectLikeService.getLikeCountByS3ObjectId(s3ObjectId);
    return { count };
  }

  /**
   * 현재 사용자가 특정 S3 객체에 좋아요를 눌렀는지 확인합니다.
   */
  @Get('s3-object/:s3ObjectId/status')
  async hasUserLikedS3Object(
    @Param('s3ObjectId') s3ObjectId: string,
    @CurrentUser() user: User,
  ) {
    const hasLiked = await this.s3ObjectLikeService.hasUserLikedS3Object(
      s3ObjectId,
      user.id,
    );
    return { hasLiked };
  }

  /**
   * 특정 S3 객체의 모든 좋아요를 삭제합니다 (관리자용).
   */
  @Delete('s3-object/:s3ObjectId/all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAllLikesByS3ObjectId(
    @Param('s3ObjectId') s3ObjectId: string,
  ): Promise<void> {
    await this.s3ObjectLikeService.removeAllLikesByS3ObjectId(s3ObjectId);
  }
}
