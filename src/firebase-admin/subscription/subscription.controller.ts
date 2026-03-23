import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { SubscriptionService } from './subscription.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(private subService: SubscriptionService) {}

  /**
   *
   * @param req
   * @returns
   */
  @UseGuards(FirebaseAuthGuard)
  @Post('premium')
  async setPremium(@Req() req) {
    return this.subService.grantPremium(req.appId, req.user.uid);
  }
}
