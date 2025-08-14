import { IsUUID, IsArray } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class RemoveUserFromGroupDto {
  @ApiProperty({
    description: 'ID of the group to remove users from',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Field()
  @IsUUID()
  groupId: string; // 그룹 ID

  @ApiProperty({
    description: 'Array of user IDs to remove from the group',
    example: ['123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002'],
    type: [String],
  })
  @Field(() => [String])
  @IsArray()
  @IsUUID('4', { each: true })
  userIds: string[]; // 제거할 사용자 ID 배열
}
