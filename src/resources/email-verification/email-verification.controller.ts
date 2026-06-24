import { Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { EmailVerificationService } from './email-verification.service';

@Controller('email-verification')
export class EmailVerificationController {
  constructor(private readonly emailVerificationService: EmailVerificationService) {}

  @Post('send')
  @HttpCode(HttpStatus.NO_CONTENT)
  async send(@Req() request: Request) {
    const uid = request.firebaseUser.uid;
    const idToken = this.extractBearerToken(request);
    await this.emailVerificationService.sendVerificationEmail(uid, idToken);
  }

  @Post('check')
  check(@Req() request: Request) {
    return this.emailVerificationService.checkVerificationStatus(request.firebaseUser.uid);
  }

  @Get('limits')
  getLimits(@Req() request: Request) {
    return this.emailVerificationService.getLimits(request.firebaseUser.uid);
  }

  private extractBearerToken(request: Request): string {
    const authorization = request.headers.authorization ?? '';
    return authorization.startsWith('Bearer ') ? authorization.slice(7) : authorization;
  }
}
