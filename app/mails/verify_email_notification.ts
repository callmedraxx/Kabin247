import BusinessSetup from '#models/business_setup';
import User from '#models/user';
import env from '#start/env';
import { BaseMail } from '@adonisjs/mail';

export default class VerifyEmailNotification extends BaseMail {
  from = env.get('SMTP_EMAIL');
  subject = ''; // Will be set dynamically
  user: User;
  token: string;
  logo: string;
  url: string;
  appName: string;

  constructor(user: User, token: string, branding: { business: BusinessSetup | null; siteUrl: string }) {
    super();
    this.user = user;
    this.token = token;
    this.url = branding.siteUrl;
    this.appName = branding.business?.name || 'Kabin247';
    this.logo = branding.siteUrl + branding?.business?.logo?.url || '';
  }

  prepare() {
    const verifyUrl = this.url + '/verify-email?token=' + this.token;
    const fromDomain = this.from.split('@')[1] || 'kabin247.com';
    const fromEmail = this.from;
    
    // Personalized subject line to improve reputation (less generic)
    const personalizedSubject = `${this.appName} - Complete your registration`;
    
    this.message.to(this.user.email);
    this.message.from(fromEmail, this.appName);
    this.message.subject(personalizedSubject);
    
    // Add authentication headers (removed X-AuthUser as it's causing reputation issues)
    // MailBaby tracks reputation on these headers, so we'll use minimal headers
    this.message.header('X-Mailer', 'Kabin247 Mail System v1.0');
    this.message.header('Reply-To', fromEmail);
    this.message.header('Return-Path', fromEmail);
    
    // List management headers
    this.message.header('List-Unsubscribe', `<mailto:unsubscribe@${fromDomain}>, <${this.url}/unsubscribe>`);
    this.message.header('List-Unsubscribe-Post', 'List-Unsubscribe=One-Click');
    this.message.header('List-Id', `<${fromDomain}>`);
    
    // Message classification (removed Precedence: bulk as it's being flagged)
    this.message.header('X-Priority', '3');
    this.message.header('X-MSMail-Priority', 'Normal');
    this.message.header('Importance', 'Normal');
    
    // Add plain text alternative FIRST (before HTML) to fix MIME_HTML_ONLY issue
    const plainText = `Hello ${this.user?.firstName || 'there'},

Thank you for registering with ${this.appName}. 

To complete your registration and activate your account, please verify your email address by clicking the link below:

${verifyUrl}

This verification link will expire in 24 hours for security reasons.

If you did not create an account with ${this.appName}, please ignore this email. No further action is required.

If you have any questions or need assistance, please contact our support team.

Best regards,
The ${this.appName} Team

---
${this.appName}
${this.url}`;

    this.message.text(plainText);
    
    // Improved HTML content with better messaging, explicit fonts, and natural language
    const userName = this.user?.firstName || 'there';
    const htmlBody = `<div style="font-family: 'Lato', 'Helvetica Neue', Arial, sans-serif; font-size: 16px; color: #333333; line-height: 1.6;">
    <h1 style="font-family: 'Lato', 'Helvetica Neue', Arial, sans-serif; font-size: 24px; font-weight: 700; color: #333333; margin-bottom: 20px;">Hello ${userName},</h1>
    <p style="font-family: 'Lato', 'Helvetica Neue', Arial, sans-serif; font-size: 16px; color: #666666; line-height: 1.6; margin-bottom: 15px;">We're excited to have you join ${this.appName}! Your account has been created successfully.</p>
    <p style="font-family: 'Lato', 'Helvetica Neue', Arial, sans-serif; font-size: 16px; color: #666666; line-height: 1.6; margin-bottom: 15px;">To get started and ensure the security of your account, we need to verify your email address. Please click the button below to complete your registration.</p>
    <p style="font-family: 'Lato', 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: #888888; line-height: 1.6; margin-bottom: 20px; font-style: italic;">For your security, this verification link will expire in 24 hours.</p>
    <p style="font-family: 'Lato', 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: #888888; line-height: 1.6; margin-top: 30px; margin-bottom: 10px;">Didn't create an account with us? You can safely ignore this message. No action is needed on your part.</p>
    <p style="font-family: 'Lato', 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: #888888; line-height: 1.6; margin-bottom: 20px;">Questions? Our support team is here to help. Simply reply to this email or visit ${this.url}.</p>
    <p style="font-family: 'Lato', 'Helvetica Neue', Arial, sans-serif; font-size: 16px; color: #666666; line-height: 1.6; margin-top: 30px;">Best regards,<br><strong style="font-family: 'Lato', 'Helvetica Neue', Arial, sans-serif; font-weight: 700;">The ${this.appName} Team</strong></p>
    <p style="font-family: 'Lato', 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #999999; line-height: 1.6; margin-top: 20px; border-top: 1px solid #eeeeee; padding-top: 15px;">${this.appName} | ${this.url}</p>
</div>`;
    
    this.message.htmlView('emails/generic_email', {
      logo: this.logo,
      title: personalizedSubject,
      body: htmlBody,
      action: true,
      actionText: 'Verify Email Address',
      actionUrl: verifyUrl,
    });
  }
}
