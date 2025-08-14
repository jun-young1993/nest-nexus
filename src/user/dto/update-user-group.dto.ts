import { PartialType } from '@nestjs/mapped-types';
import { CreateUserGroupDto } from './create-user-group.dto';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateUserGroupDto extends PartialType(CreateUserGroupDto) {
  // PartialType을 사용하여 CreateUserGroupDto의 모든 필드를 선택적으로 만듦
  // 추가적인 수정 전용 필드가 필요하면 여기에 추가
}
