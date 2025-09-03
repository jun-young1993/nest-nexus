import { PartialType } from '@nestjs/swagger';
import { CreatePaymentScheduleDto } from './create-payment-schedule.dto';

/**
 * 상환 스케줄 수정 DTO
 * CreatePaymentScheduleDto의 모든 필드를 선택적으로 받을 수 있음
 */
export class UpdatePaymentScheduleDto extends PartialType(CreatePaymentScheduleDto) {}
