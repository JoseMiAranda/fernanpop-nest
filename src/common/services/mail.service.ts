import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;

    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY no está configurada; el envío de correos está deshabilitado.');
    }
  }

  async sendVerificationEmail(
    to: string,
    verificationLink: string,
    displayName?: string,
  ): Promise<void> {
    const from = this.configService.get<string>('RESEND_FROM_EMAIL');

    if (!this.resend) {
      throw new Error('RESEND_API_KEY no está configurada.');
    }

    if (!from) {
      throw new Error('RESEND_FROM_EMAIL no está configurada.');
    }

    const greeting = displayName?.trim() ? `Hola ${displayName.trim()},` : 'Hola,';

    const { error } = await this.resend.emails.send({
      from,
      to,
      subject: 'Verifica tu correo en Fernanpop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
          <h1 style="font-size: 22px; margin-bottom: 16px;">Verifica tu correo</h1>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
            ${greeting}
          </p>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            Gracias por registrarte en Fernanpop. Haz clic en el botón para confirmar tu correo y activar tu cuenta.
          </p>
          <p style="margin-bottom: 32px;">
            <a
              href="${verificationLink}"
              style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;"
            >
              Verificar correo
            </a>
          </p>
          <p style="font-size: 14px; line-height: 1.5; color: #4b5563; margin-bottom: 16px;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:
          </p>
          <p style="font-size: 14px; line-height: 1.5; color: #2563eb; word-break: break-all;">
            ${verificationLink}
          </p>
          <p style="font-size: 13px; line-height: 1.5; color: #6b7280; margin-top: 32px;">
            Si no creaste una cuenta en Fernanpop, puedes ignorar este correo.
          </p>
        </div>
      `,
    });

    if (error) {
      this.logger.error(`Resend devolvió un error al enviar a ${to}: ${error.message}`);
      throw new Error(error.message);
    }
  }
}
