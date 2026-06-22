import * as admin from 'firebase-admin';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Seller } from '../../resources/sellers/entities/seller.entity';

@Injectable()
export class UserProfileService {
  async getSellerProfile(userId: string): Promise<Seller> {
    try {
      const user = await admin.auth().getUser(userId);
      const email = user.email ?? '';
      const displayName = user.displayName?.trim() || email.split('@')[0] || 'Vendedor';

      return {
        id: user.uid,
        displayName,
        photoUrl: user.photoURL ?? undefined,
        email: email || undefined,
      };
    } catch {
      throw new HttpException('seller-not-found', HttpStatus.NOT_FOUND);
    }
  }
}
