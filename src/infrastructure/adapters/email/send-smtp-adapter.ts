import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../configuration/getConfiguration';

@Injectable()
export class SendSMTPAdapter {
  constructor(private configService: ConfigService<ConfigType>) {}
  send(mailOptions: Mail.Options) {
    try {
      const transporter = createTransport({
        host: 'smtp.mail.ru',
        port: 465, //  порт 587 для STARTTLS
        secure: true, // false для использования STARTTLS
        auth: {
          user: this.configService.get('mail_auth.user', { infer: true }),
          pass: this.configService.get('mail_auth.password', { infer: true }),
        },
      });

      transporter.verify();

      transporter.sendMail(mailOptions);

      return true;
    } catch (err) {
      // обработка ошибки
      console.error(err);
      return false;
    }
  }
}
