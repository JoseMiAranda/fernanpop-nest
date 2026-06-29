import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export interface EncryptedMessagePayload {
  ciphertext: string;
  iv: string;
  authTag: string;
}

@Injectable()
export class MessageEncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    const encryptionKey = process.env.MESSAGES_ENCRYPTION_KEY;

    if (!encryptionKey) {
      throw new InternalServerErrorException('messages-encryption-key-not-configured');
    }

    this.key = this.parseEncryptionKey(encryptionKey);
  }

  encrypt(plainText: string): EncryptedMessagePayload {
    const iv = randomBytes(12);
    const cipher = createCipheriv(this.algorithm, this.key, iv);

    const ciphertext = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);

    return {
      ciphertext: ciphertext.toString('base64'),
      iv: iv.toString('base64'),
      authTag: cipher.getAuthTag().toString('base64'),
    };
  }

  decrypt(payload: EncryptedMessagePayload): string {
    const decipher = createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(payload.iv, 'base64'),
    );

    decipher.setAuthTag(Buffer.from(payload.authTag, 'base64'));

    const plainText = Buffer.concat([
      decipher.update(Buffer.from(payload.ciphertext, 'base64')),
      decipher.final(),
    ]);

    return plainText.toString('utf8');
  }

  private parseEncryptionKey(encryptionKey: string): Buffer {
    if (/^[0-9a-fA-F]{64}$/.test(encryptionKey)) {
      return Buffer.from(encryptionKey, 'hex');
    }

    if (/^[A-Za-z0-9+/]{43}=$/.test(encryptionKey)) {
      return Buffer.from(encryptionKey, 'base64');
    }

    throw new InternalServerErrorException('messages-encryption-key-invalid');
  }
}
