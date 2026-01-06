import {
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudRunDeepFaceService } from './cloud-run-deep-face.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Cloud Run / AI Hub / Deep Face')
@Controller('cloud-run/ai-hub/deep-face')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CloudRunDeepFaceController {
  constructor(
    private readonly cloudRunDeepFaceService: CloudRunDeepFaceService,
  ) {}

  @Post('upload-temp')
  @ApiOperation({ summary: '임시 파일 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '파일 업로드 요청',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: '업로드할 파일들 (최대 5개)',
          minItems: 1,
          maxItems: 5,
        },
      },
      required: ['files'],
    },
  })
  @UseInterceptors(FilesInterceptor('files', 5))
  @ApiResponse({ status: 200, description: '파일 업로드 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async uploadTemp(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: User,
  ) {
    return this.cloudRunDeepFaceService.uploadTemp(files, user);
  }
}
