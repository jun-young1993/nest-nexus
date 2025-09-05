import { PartialType } from '@nestjs/swagger';
import { CreateSequenceDto } from './create-sequence.dto';

/**
 * 시퀀스 수정 DTO
 * CreateSequenceDto의 모든 필드를 선택적으로 받을 수 있음
 */
export class UpdateSequenceDto extends PartialType(CreateSequenceDto) {}
