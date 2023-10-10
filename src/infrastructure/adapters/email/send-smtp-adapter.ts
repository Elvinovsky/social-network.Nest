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
        host: 'smtp-mail.outlook.com',
        port: 587, //  порт 587 для STARTTLS
        secure: false, // false для использования STARTTLS
        auth: {
          user: this.configService.get('mail_auth.user', { infer: true }),
          pass: this.configService.get('mail_auth.password', { infer: true }),
        },
        requireTLS: true, // Обязательное использование TLS
        tls: {
          ciphers: 'SSLv3', // Установка желаемого набора шифров
        },
      });

      await transporter.verify();

      transporter.sendMail(mailOptions, (e) => {
        console.log(e);
        return false;
      });

      return true;
    } catch (err) {
      // обработка ошибки
      console.error(err);
      return false;
    }
  }
}
