import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import firebase from '../../firebase/firebase';
import {
  EMAIL_VERIFICATION_CHECK_LIMIT,
  EMAIL_VERIFICATION_SEND_LIMIT,
  RATE_LIMIT_EXCEEDED,
} from '../../common/constants/email-verification-limits';
import { MailService } from '../../common/services/mail.service';
import { RateLimiterService } from '../../common/services/rate-limiter.service';

export type EmailVerificationAction = 'send' | 'check';

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    private readonly rateLimiter: RateLimiterService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async sendVerificationEmail(uid: string): Promise<void> {
    this.assertWithinLimit(uid, 'send', EMAIL_VERIFICATION_SEND_LIMIT);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      throw new HttpException(
        { message: 'email-verification-unavailable' },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const user = await firebase.auth().getUser(uid);
    if (!user.email) {
      throw new HttpException(
        { message: 'email-verification-send-failed' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const verifyEmailUrl = `${frontendUrl.replace(/\/$/, '')}/verify-email`;
    const actionCodeSettings = {
      url: verifyEmailUrl,
      handleCodeInApp: true,
    };

    let verificationLink: string;
    try {
      const firebaseLink = await firebase
        .auth()
        .generateEmailVerificationLink(user.email, actionCodeSettings);
      verificationLink = this.buildFrontendVerificationLink(firebaseLink, verifyEmailUrl);
    } catch (error) {
      this.logger.error(
        `No se pudo generar el enlace de verificación para ${user.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        { message: 'email-verification-send-failed' },
        HttpStatus.BAD_GATEWAY,
      );
    }

    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        verificationLink,
        user.displayName,
      );
    } catch (error) {
      this.logger.error(
        `No se pudo enviar el correo de verificación a ${user.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        { message: 'email-verification-send-failed' },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private buildFrontendVerificationLink(firebaseLink: string, verifyEmailUrl: string): string {
    const firebaseUrl = new URL(firebaseLink);
    const oobCode = firebaseUrl.searchParams.get('oobCode');

    if (!oobCode) {
      throw new Error('El enlace generado por Firebase no contiene oobCode.');
    }

    const frontendLink = new URL(verifyEmailUrl);
    frontendLink.searchParams.set('mode', 'verifyEmail');
    frontendLink.searchParams.set('oobCode', oobCode);

    return frontendLink.toString();
  }

  async checkVerificationStatus(uid: string): Promise<{ emailVerified: boolean }> {
    this.assertWithinLimit(uid, 'check', EMAIL_VERIFICATION_CHECK_LIMIT);
    const user = await firebase.auth().getUser(uid);
    return { emailVerified: user.emailVerified };
  }

  getLimits(uid: string) {
    return {
      send: this.rateLimiter.peek(this.sendKey(uid), EMAIL_VERIFICATION_SEND_LIMIT),
      check: this.rateLimiter.peek(this.checkKey(uid), EMAIL_VERIFICATION_CHECK_LIMIT),
    };
  }

  private assertWithinLimit(
    uid: string,
    action: EmailVerificationAction,
    config: typeof EMAIL_VERIFICATION_SEND_LIMIT,
  ): void {
    const key = action === 'send' ? this.sendKey(uid) : this.checkKey(uid);
    const result = this.rateLimiter.consume(key, config);

    if (!result.allowed) {
      throw new HttpException(
        {
          message: RATE_LIMIT_EXCEEDED,
          action,
          retryAfterMs: result.retryAfterMs,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private sendKey(uid: string): string {
    return `email_verification_send:${uid}`;
  }

  private checkKey(uid: string): string {
    return `email_verification_check:${uid}`;
  }
}
