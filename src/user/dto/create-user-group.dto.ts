import { IsString, IsOptional, IsBoolean, Length } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@InputType()
export class CreateUserGroupDto {
  @ApiProperty({
    description: 'User group name (must be unique)',
    example: 'Developers',
    minLength: 1,
    maxLength: 100,
  })
  @Field()
  @IsString()
  @Length(1, 100)
  name: string; // 그룹 이름

  @ApiPropertyOptional({
    description: 'Optional description for the user group',
    example: 'Development team members',
    maxLength: 500,
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string; // 그룹 설명 (선택사항)

  @ApiPropertyOptional({
    description: 'Whether the group is active (default: true)',
    example: true,
    default: true,
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean; // 그룹 활성 상태 (기본값: true)

  @ApiPropertyOptional({
    description: 'Whether this is a system group (default: false, cannot be modified/deleted)',
    example: false,
    default: false,
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean; // 시스템 그룹 여부 (기본값: false)
}
