import { PartialType } from '@nestjs/swagger';
import { Field, ObjectType } from '@nestjs/graphql';
import { CreateLoanDto } from './create-loan.dto';

@ObjectType()
export class UpdateLoanDto extends PartialType(CreateLoanDto) {}
