import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';

@Injectable()
export class SendSMTPAdapter {
  async send(mailOptions) {
    try {
      const transporter = await createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.AUTH_EMAIL,
          pass: process.env.AUTH_PASS,
        },
      });

      await transporter.verify();

      transporter.sendMail(
        mailOptions /*(r, e) => {
        console.log(e);
      }*/,
      );

      return true;
    } catch (err) {
      // обработка ошибки
      console.error(err);
      return false;
    }
  }
}
