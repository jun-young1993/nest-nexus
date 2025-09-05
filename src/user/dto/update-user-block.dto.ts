import { PartialType } from '@nestjs/swagger';
import { CreateUserBlockDto } from './create-user-block.dto';

/**
 * 사용자 블록 수정 DTO
 * CreateUserBlockDto의 모든 필드를 선택적으로 받을 수 있음
 */
export class UpdateUserBlockDto extends PartialType(CreateUserBlockDto) {}
