import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { Request, Response } from 'express';

@Injectable()
export class EmailVerifiedCheck implements NestMiddleware {
  use(req: Request, _: Response, next: Function) {
    if (!req.firebaseUser?.email_verified) {
      throw new HttpException({ message: 'email-not-verified' }, HttpStatus.FORBIDDEN);
    }

    next();
  }
}
