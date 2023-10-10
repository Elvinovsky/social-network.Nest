import { Injectable } from '@nestjs/common';
import { SendSMTPAdapter } from './send-smtp-adapter';

@Injectable()
export class EmailSenderService {
  constructor(private adapter: SendSMTPAdapter) {}
  async sendEmailConformationMessage(
    email: string,
    code: string,
  ): Promise<boolean> {
    const mailOptions = {
      from: 'ELVIN <elov2024@mail.ru>', // sender address
      to: email, // list of receivers
      subject: 'email confirmation', // Subject line
      html: `<h1>Thanks for your registration</h1>
        <p>To finish registration please follow the link below:
            <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
        </p>`, // plain text body
    };
    // send mail
    return this.adapter.send(mailOptions);
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
    return this.adapter.send(mailOptions);
  }
}
