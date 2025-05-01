import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AlieAffiliateService } from '../alie/alie-affiliate.service';
import { GithubContentService } from '../github/github-content.service';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { MyCarService } from 'src/parking-location/my-car.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly alieAffiliateService: AlieAffiliateService,
    private readonly githubContentService: GithubContentService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly myCarService: MyCarService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Cron('0 */2 * * * *')
  async checkExpectedTimeCarNumbers() {
    this.logger.task('[CHECK EXPECTED TIME CAR NUMBERS][START]');
    const carNumbers = await this.myCarService.findCarNumbersWithExpiredTime(5);
    this.logger.task(
      `[CHECK EXPECTED TIME CAR NUMBERS][END] ${carNumbers.length}`,
    );

    if (carNumbers.length > 0) {
      carNumbers.forEach((carNumber) => {
        this.myCarService.update(carNumber.id, {
          isParked: !carNumber.isParked,
          expectedTime: null,
        });
      });
    }
    // 예상 시간이 만료된 차량 번호 목록을 체크하는 크론 작업
  }
}
