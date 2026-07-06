import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {}

  private getTransporter() {
    if (!this.transporter) {
      const user = this.configService.get<string>('SMTP_USER');
      const pass = this.configService.get<string>('SMTP_PASS');
      
      this.logger.log(`Init Mail Transporter with user: ${user}`);
      
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    }
    return this.transporter;
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    const smtpUser = this.configService.get<string>('SMTP_USER');

    const mailOptions = {
      from: `"DearLove Support" <${smtpUser}>`,
      to,
      subject: 'Đặt lại mật khẩu - DearLove',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #e11d48; text-align: center;">DearLove</h2>
          <p>Xin chào,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng click vào nút bên dưới để tiến hành đặt lại mật khẩu:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Đặt lại mật khẩu</a>
          </div>
          <p>Lưu ý: Link này chỉ có hiệu lực trong vòng 1 giờ.</p>
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">&copy; ${new Date().getFullYear()} DearLove Wedding Invitation Builder.</p>
        </div>
      `,
    };

    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${to}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Error sending email to ${to}`, error);
      throw new Error('Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.');
    }
  }
}
