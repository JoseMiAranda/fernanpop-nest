import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import firebase from '../../firebase/firebase';
import {
  EMAIL_VERIFICATION_CHECK_LIMIT,
  EMAIL_VERIFICATION_SEND_LIMIT,
  RATE_LIMIT_EXCEEDED,
} from '../../common/constants/email-verification-limits';
import { RateLimiterService } from '../../common/services/rate-limiter.service';

export type EmailVerificationAction = 'send' | 'check';

const FIREBASE_EMAIL_LOCALE = 'es';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly rateLimiter: RateLimiterService,
    private readonly configService: ConfigService,
  ) {}

  async sendVerificationEmail(uid: string, idToken: string): Promise<void> {
    this.assertWithinLimit(uid, 'send', EMAIL_VERIFICATION_SEND_LIMIT);
    await this.sendOobCode(idToken);
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

  private async sendOobCode(idToken: string): Promise<void> {
    const apiKey = this.configService.get<string>('FIREBASE_WEB_API_KEY');

    if (!apiKey) {
      throw new HttpException(
        { message: 'email-verification-unavailable' },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Firebase-Locale': FIREBASE_EMAIL_LOCALE,
        },
        body: JSON.stringify({
          requestType: 'VERIFY_EMAIL',
          idToken,
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const firebaseMessage = errorBody?.error?.message as string | undefined;

      if (firebaseMessage === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
        throw new HttpException(
          { message: 'firebase-too-many-requests' },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new HttpException(
        { message: 'email-verification-send-failed' },
        HttpStatus.BAD_GATEWAY,
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
