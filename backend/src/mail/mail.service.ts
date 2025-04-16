
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class MailService {
  private readonly defaultFrom = 'recapifyapplication@gmail.com';
  private readonly appPassword = 'pxau xcmj wiqj vgkq';

  async sendMail(dto: SendMailDto): Promise<void> {
    const { to, subject, text } = dto;

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.defaultFrom,
          pass: this.appPassword,
        },
        tls: {
          rejectUnauthorized: false, // <-- ignorer les certificats non vérifiés
        },
      });

      await transporter.sendMail({
        from: this.defaultFrom,
        to,
        subject,
        text,
      });
    } catch (error) {
      console.error('Erreur lors de l’envoi du mail :', error);
      throw new InternalServerErrorException('Erreur lors de l’envoi du mail');
    }
  }
}
