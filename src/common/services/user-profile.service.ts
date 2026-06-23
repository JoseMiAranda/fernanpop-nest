import * as admin from 'firebase-admin';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Seller } from '../../resources/sellers/entities/seller.entity';

@Injectable()
export class UserProfileService {
  async getSellerProfile(userId: string): Promise<Seller> {
    try {
      const user = await admin.auth().getUser(userId);
      const email = user.email ?? '';
      const displayName = this.resolveDisplayName(user);

      return {
        id: user.uid,
        displayName,
        photoUrl: this.resolvePhotoUrl(user),
        email: email || undefined,
      };
    } catch {
      throw new HttpException('seller-not-found', HttpStatus.NOT_FOUND);
    }
  }

  async getDisplayNamesByIds(userIds: string[]): Promise<Map<string, string>> {
    const uniqueIds = [...new Set(userIds.filter(Boolean))];
    const displayNames = new Map<string, string>();

    if (uniqueIds.length === 0) {
      return displayNames;
    }

    const usersResult = await admin.auth().getUsers(uniqueIds.map((uid) => ({ uid })));

    for (const user of usersResult.users) {
      displayNames.set(user.uid, this.resolveDisplayName(user));
    }

    return displayNames;
  }

  private resolvePhotoUrl(user: admin.auth.UserRecord): string | undefined {
    if (user.photoURL) {
      return user.photoURL;
    }

    const googleProvider = user.providerData?.find((p) => p.providerId === 'google.com');
    if (googleProvider?.photoURL) {
      return googleProvider.photoURL;
    }

    return user.providerData?.find((p) => p.photoURL)?.photoURL ?? undefined;
  }

  private resolveDisplayName(user: admin.auth.UserRecord): string {
    const email = user.email ?? '';
    return user.displayName?.trim() || email.split('@')[0] || 'Usuario';
  }
}
