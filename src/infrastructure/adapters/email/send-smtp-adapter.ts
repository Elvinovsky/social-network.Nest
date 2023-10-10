import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../configuration/getConfiguration';

@Injectable()
export class SendSMTPAdapter {
  constructor(private configService: ConfigService<ConfigType>) {}
  async send(mailOptions: Mail.Options) {
    try {
      const transporter = createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: this.configService.get('mail_auth.user', { infer: true }),
          pass: this.configService.get('mail_auth.password', { infer: true }),
        },
      });

      await transporter.verify();

      transporter.sendMail(mailOptions, (r, e) => {
        console.log(e);
      });

      return true;
    } catch (err) {
      // обработка ошибки
      console.error(err);
      return false;
    }
  }
}
