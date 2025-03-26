import { ApiProperty } from '@nestjs/swagger';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class NoticeGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @ApiProperty({
    example: 'test notice group',
  })
  name: string;
}
