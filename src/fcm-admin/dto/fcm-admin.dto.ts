import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class NotificationDto {
  @ApiProperty({ description: '알림 제목' })
  @IsString()
  title: string;

  @ApiProperty({ description: '알림 내용' })
  @IsString()
  body: string;

  @ApiPropertyOptional({ description: '알림 이미지 URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class AndroidConfigDto {
  @ApiPropertyOptional({ description: '알림 우선순위' })
  @IsOptional()
  @IsString()
  priority?: 'normal' | 'high';

  @ApiPropertyOptional({ description: '알림 사운드' })
  @IsOptional()
  @IsString()
  sound?: string;
}

export class ApnsConfigDto {
  @ApiPropertyOptional({ description: '알림 우선순위' })
  @IsOptional()
  @IsString()
  priority?: '5' | '10';

  @ApiPropertyOptional({ description: '알림 사운드' })
  @IsOptional()
  @IsString()
  sound?: string;
}

export class DataDto {
  @ApiPropertyOptional({ description: '추가 데이터 (키-값 쌍)' })
  @IsOptional()
  @IsObject()
  data?: { [key: string]: string };
}

export class MessageDto {
  @ApiPropertyOptional({ description: 'FCM 토큰' })
  @IsOptional()
  @IsString()
  token?: string;

  @ApiPropertyOptional({ description: '토픽' })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional({ description: '조건' })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({ description: '알림 정보' })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationDto)
  notification?: NotificationDto;

  @ApiPropertyOptional({ description: '추가 데이터' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DataDto)
  data?: DataDto;

  @ApiPropertyOptional({ description: 'Android 설정' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AndroidConfigDto)
  android?: AndroidConfigDto;

  @ApiPropertyOptional({ description: 'APNS 설정' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ApnsConfigDto)
  apns?: ApnsConfigDto;
}

export class MulticastMessageDto {
  @ApiProperty({ description: 'FCM 토큰 배열' })
  @IsArray()
  @IsString({ each: true })
  tokens: string[];

  @ApiPropertyOptional({ description: '알림 정보' })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationDto)
  notification?: NotificationDto;

  @ApiPropertyOptional({ description: '추가 데이터' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DataDto)
  data?: DataDto;

  @ApiPropertyOptional({ description: 'Android 설정' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AndroidConfigDto)
  android?: AndroidConfigDto;

  @ApiPropertyOptional({ description: 'APNS 설정' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ApnsConfigDto)
  apns?: ApnsConfigDto;
}

export class SendMulticastMessageDto {
  @ApiProperty({ description: '멀티캐스트 메시지' })
  @ValidateNested()
  @Type(() => MulticastMessageDto)
  message: MulticastMessageDto;

  @ApiPropertyOptional({ description: '테스트 모드 (실제 전송하지 않음)' })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}

export class SendMessageDto {
  @ApiProperty({ description: '메시지' })
  @ValidateNested()
  @Type(() => MessageDto)
  message: MessageDto;

  @ApiPropertyOptional({ description: '테스트 모드 (실제 전송하지 않음)' })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}

export class SendMultipleMessagesDto {
  @ApiProperty({ description: '메시지 배열' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];

  @ApiPropertyOptional({ description: '테스트 모드 (실제 전송하지 않음)' })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}

export class SubscribeToTopicDto {
  @ApiProperty({ description: 'FCM 토큰 배열' })
  @IsArray()
  @IsString({ each: true })
  tokens: string[];

  @ApiProperty({ description: '토픽명' })
  @IsString()
  topic: string;
}

export class SendToTopicDto {
  @ApiProperty({ description: '토픽명' })
  @IsString()
  topic: string;

  @ApiPropertyOptional({ description: '알림 정보' })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationDto)
  notification?: NotificationDto;

  @ApiPropertyOptional({ description: '추가 데이터' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DataDto)
  data?: DataDto;

  @ApiPropertyOptional({ description: 'Android 설정' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AndroidConfigDto)
  android?: AndroidConfigDto;

  @ApiPropertyOptional({ description: 'APNS 설정' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ApnsConfigDto)
  apns?: ApnsConfigDto;

  @ApiPropertyOptional({ description: '테스트 모드 (실제 전송하지 않음)' })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}
