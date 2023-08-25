import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
@Injectable()
export class EmailService {
  async sendEmailConformationMessage(
    email: string,
    code: string,
  ): Promise<boolean> {
    const mailOptions = {
      from: 'ELVIN <elov2024@mail.ru>', // sender address
      to: email, // list of receivers
      subject: 'email confirmation', // Subject line
      html: `<h1>Thank for your registration</h1>
        <p>To finish registration please follow the link below:
            <a href='https://somesite.net?code=${code}'>complete registration</a>
        </p>`, // plain text body
    };
    // send mail
    return this._isSent(mailOptions);
  }

  async sendEmailPasswordRecovery(
    email: string,
    newCode: string,
  ): Promise<boolean> {
    const mailOptions = {
      from: 'ELVIN <elov2024@mail.ru>', // sender address
      to: email, // list of receivers
      subject: 'PASSWORD RECOVERY', // Subject line
      html: ` <h1>To finish password recovery</h1>
       <p> Please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${newCode}'>recovery password</a>
      </p>`, // plain text body
    };

    // send mail
    return this._isSent(mailOptions);
  }
  async _isSent(mailOptions) {
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

      await transporter.verify((r, e) => {
        console.log(e);
      });

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
