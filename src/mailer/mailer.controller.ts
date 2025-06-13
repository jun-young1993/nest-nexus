import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MailerService } from './mailer.service';
import { AppConfigService } from 'src/app-config/app-config.service';

@ApiTags('Mailer')
@Controller('mailer')
export class MailerController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly appConfigService: AppConfigService,
  ) {}
}
