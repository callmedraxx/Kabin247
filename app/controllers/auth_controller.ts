import User from '#models/user';
import type { HttpContext } from '@adonisjs/core/http';
import { registerValidator, resetPasswordValidator } from '#validators/auth';
import notification_service from '#services/notification_service';
import Token from '#models/token';
import ResetPasswordNotification from '#mails/reset_password_notification';
import mail from '@adonisjs/mail/services/main';
import useBranding from '#services/use_branding';
import VerifyEmailNotification from '#mails/verify_email_notification';
import { DateTime } from 'luxon';
import errorHandler from '#exceptions/error_handler';
import env from '#start/env';

export default class AuthController {
  async loginView({ inertia }: HttpContext) {
    return inertia.render('Auth/Auth');
  }

  async signupView({ inertia }: HttpContext) {
    return inertia.render('Auth/Auth');
  }

  async forgotPasswordView({ inertia }: HttpContext) {
    return inertia.render('Auth/ForgotPassword');
  }

  async newPasswordView({ inertia }: HttpContext) {
    return inertia.render('Auth/NewPassword');
  }

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - name
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 format: password
   *                 example: password123
   *               name:
   *                 type: string
   *                 example: John Doe
   *     responses:
   *       200:
   *         description: Registration successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 user:
   *                   type: object
   *       400:
   *         description: Bad request (email already in use)
   */
  async register({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerValidator);
      
      const isEmailUnique = await User.isEmailUnique(payload.email, 6);
      if (!isEmailUnique) {
        return response.badRequest({ success: false, message: 'Email is already in use' });
      }

      const user = await User.create(payload);
      await notification_service.sendNewRegistraionNotification(user);
      const token = await Token.generateVerifyEmailToken(user);
      const branding = await useBranding();
      
      // Try to send verification email, but don't fail registration if SMTP fails
      let emailError = null;
      try {
        await mail.send(
          new VerifyEmailNotification(user, token, {
            business: branding.business,
            siteUrl: branding.siteUrl || '',
          })
        );
      } catch (mailError: any) {
        emailError = {
          code: mailError.code || 'MAIL_ERROR',
          message: mailError.message || 'Failed to send verification email',
          response: mailError.response || mailError.responseCode || null,
          command: mailError.command || null,
          details: mailError.response || mailError.message || 'Unknown error',
        };
        logger.error('Failed to send verification email during registration:', {
          code: emailError.code,
          message: emailError.message,
          response: emailError.response,
          command: emailError.command,
          fullError: mailError,
        });
        // Continue with registration even if email fails
      }

      return response.json({
        success: true,
        message: emailError
          ? 'Registration was successful, but we could not send the verification email. Please use the resend verification feature to receive your verification link.'
          : 'Registration was successful. We sent a verification link to your email. Please check your email to verify your account.',
        user,
        emailError: emailError, // Include error details for debugging
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Registration Error');
    }
  }

  /**
   * @swagger
   * /api/auth/check-email:
   *   get:
   *     summary: Check if email already exists
   *     tags: [Auth]
   *     parameters:
   *       - in: query
   *         name: email
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Email availability check result
   */
  async checkEmail({ request, response }: HttpContext) {
    try {
      const email = request.qs().email;
      if (!email) {
        return response.badRequest({ success: false, message: 'Email is required' });
      }

      const existingUser = await User.query().where('email', email).first();
      return response.json({
        success: true,
        available: !existingUser,
        message: existingUser ? 'Email is already in use' : 'Email is available',
      });
    } catch (error) {
      return response.status(500).json({ success: false, message: 'Error checking email' });
    }
  }

  /**
   * @swagger
   * /api/auth/check-phone:
   *   get:
   *     summary: Check if phone number already exists
   *     tags: [Auth]
   *     parameters:
   *       - in: query
   *         name: phone
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Phone availability check result
   */
  async checkPhone({ request, response }: HttpContext) {
    try {
      const phone = request.qs().phone;
      if (!phone) {
        return response.badRequest({ success: false, message: 'Phone number is required' });
      }

      const existingUser = await User.query().where('phoneNumber', phone).first();
      return response.json({
        success: true,
        available: !existingUser,
        message: existingUser ? 'Phone number is already in use' : 'Phone number is available',
      });
    } catch (error) {
      return response.status(500).json({ success: false, message: 'Error checking phone number' });
    }
  }

  async verifyEmail({ request, inertia }: HttpContext) {
    try {
      const { token } = request.qs();
      if (!token) {
        throw new Error('Token is not provided');
      }
      const record = await Token.verify(token, 'VERIFY_EMAIL');
      if (!record) {
        throw new Error('Token is invalid');
      }
      const user = await User.find(record.userId);
      if (!user) {
        throw new Error('User is not found');
      }
      user.isEmailVerified = true;
      user.isSuspended = false;
      user.save();
      await record.delete();

      return inertia.render('Auth/VerifyEmail', {
        success: true,
        message: 'Your email has been verified successfully.',
        email: user.email,
      });
    } catch (error) {
      // Try to get user email from token if available
      let userEmail = '';
      try {
        const { token } = request.qs();
        if (token) {
          const record = await Token.findBy('token', token);
          if (record) {
            const user = await User.find(record.userId);
            if (user) {
              userEmail = user.email;
            }
          }
        }
      } catch {
        // Ignore errors when trying to get email
      }

      return inertia.render('Auth/VerifyEmail', {
        success: false,
        message: error.message || 'Something went wrong while verifying your email',
        email: userEmail,
      });
    }
  }

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Login user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 format: password
   *                 example: password123
   *               isRememberMe:
   *                 type: boolean
   *                 example: false
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 login:
   *                   type: boolean
   *                 user:
   *                   type: object
   *                 requiredVerification:
   *                   type: boolean
   *                 message:
   *                   type: string
   *       401:
   *         description: Invalid credentials or account suspended
   */
  async login({ logger, auth, request, response }: HttpContext) {
    const { email, password, isRememberMe } = request.only(['email', 'password', 'isRememberMe']);
    try {
      var user = await User.findBy('email', email);
      if (!user) {
        return response.abort('Invalid credentials');
      }

      await User.verifyCredentials(email, password);

      const branding = await useBranding();
      if (user.isEmailVerified == false) {
        const token = await user
          .related('tokens')
          .query()
          .where('type', 'VERIFY_EMAIL')
          .where('expiresAt', '>', DateTime.now().toSQL())
          .orderBy('createdAt', 'desc')
          .first();
        if (token) {
          await token.delete();
        }
        const newToken = await Token.generateVerifyEmailToken(user);
        
        // Try to send verification email, but don't fail login if SMTP fails
        let emailError = null;
        try {
          await mail.send(
            new VerifyEmailNotification(user, newToken, {
              business: branding.business,
              siteUrl: branding.siteUrl || '',
            })
          );
        } catch (mailError: any) {
          emailError = {
            code: mailError.code || 'MAIL_ERROR',
            message: mailError.message || 'Failed to send verification email',
            response: mailError.response || mailError.responseCode || null,
            command: mailError.command || null,
            details: mailError.response || mailError.message || 'Unknown error',
          };
          logger.error('Failed to send verification email during login:', {
            code: emailError.code,
            message: emailError.message,
            response: emailError.response,
            command: emailError.command,
            fullError: mailError,
          });
        }
        
        return response.json({
          login: false,
          requiredVerification: true,
          message: emailError
            ? 'We could not send the verification email. Please use the resend verification link below to receive your verification email.'
            : 'We sent a verification link to your email. Please check your email to verify your account. If you did not receive it, you can request a new verification link.',
          emailError: emailError, // Include error details for debugging
        });
      }

      if (user?.isSuspended) {
        return response.unauthorized({ success: false, message: 'Account is Suspended' });
      }

      await auth.use('web').login(user, !!isRememberMe);
      user = await User.query().where('email', email).preload('role').preload('airport').first();
      return response.json({ login: true, user });
    } catch (error) {
      errorHandler(error, response, logger, 'Login Error');
    }
  }

  /**
   * @swagger
   * /api/auth/forgot-password:
   *   post:
   *     summary: Request password reset
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *     responses:
   *       200:
   *         description: Password reset email sent
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *       400:
   *         description: Email not found or invalid request
   */
  async forgotPassword({ logger, request, response }: HttpContext) {
    try {
      const { email } = request.all();
      if (!email) {
        return response.badRequest({
          success: false,
          message: 'email is not found',
        });
      }
      const user = await User.findBy('email', email);
      if (!user) {
        return response.badRequest({ success: false, message: "Email doesn't exist" });
      }
      const token = await Token.generatePasswordResetToken(user);
      const branding = await useBranding();
      await mail.send(
        new ResetPasswordNotification(user, token, {
          business: branding.business,
          siteUrl: branding.siteUrl || '',
        })
      );

      return response.json({ success: true, message: 'A verification link is sent to your mail' });
    } catch (error) {
      errorHandler(error, response, logger, 'Forgot password Error');
    }
  }

  /**
   * @swagger
   * /api/auth/reset-password:
   *   post:
   *     summary: Reset password with token
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - password
   *               - token
   *             properties:
   *               password:
   *                 type: string
   *                 format: password
   *                 example: newPassword123
   *               token:
   *                 type: string
   *                 example: reset-token-here
   *     responses:
   *       200:
   *         description: Password reset successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *       400:
   *         description: Invalid token or user not found
   */
  async resetPassword({ logger, request, response }: HttpContext) {
    try {
      const { password, token } = await request.validateUsing(resetPasswordValidator);
      const record = await Token.verify(token, 'PASSWORD_RESET');
      if (!record) {
        return response.badRequest({ success: false, message: 'Token is invalid' });
      }
      const user = await User.find(record.userId);
      if (!user) {
        return response.badRequest({ success: false, message: 'User not found' });
      }
      user.password = password;
      user.save();
      await record.delete();

      return response.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      errorHandler(error, response, logger, 'Reset password Error');
    }
  }

  /**
   * @swagger
   * /api/auth/check:
   *   get:
   *     summary: Check authentication status
   *     tags: [Auth]
   *     security:
   *       - sessionAuth: []
   *     responses:
   *       200:
   *         description: Authentication status
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 login:
   *                   type: boolean
   *                 user:
   *                   type: object
   *       400:
   *         description: Not authenticated
   */
  async checkAuth({ auth, response }: HttpContext) {
    if (auth.user) {
      const user = await User.query().where('email', auth?.user?.email).preload('role').preload('airport').first();
      return response.json({ login: true, user });
    } else {
      return response.badRequest({ login: false });
    }
  }

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: Logout user
   *     tags: [Auth]
   *     security:
   *       - sessionAuth: []
   *     responses:
   *       200:
   *         description: Logout successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */
  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout();
    return response.json({ message: 'Logout successful' });
  }

  /**
   * @swagger
   * /api/auth/test-smtp:
   *   post:
   *     summary: Test SMTP configuration
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: test@example.com
   *     responses:
   *       200:
   *         description: Test email sent successfully
   *       400:
   *         description: Bad request
   *       500:
   *         description: SMTP configuration error
   */
  /**
   * @swagger
   * /api/auth/resend-verification:
   *   post:
   *     summary: Resend email verification link
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *     responses:
   *       200:
   *         description: Verification email sent successfully
   *       400:
   *         description: Bad request
   *       404:
   *         description: User not found
   */
  async resendVerification({ request, response, logger }: HttpContext) {
    try {
      const { email } = request.only(['email']);

      if (!email) {
        return response.badRequest({
          success: false,
          message: 'Email address is required',
        });
      }

      const user = await User.findBy('email', email);
      if (!user) {
        return response.notFound({
          success: false,
          message: 'User not found',
        });
      }

      if (user.isEmailVerified) {
        return response.badRequest({
          success: false,
          message: 'Email is already verified',
        });
      }

      // Delete existing verification tokens
      const existingTokens = await user
        .related('tokens')
        .query()
        .where('type', 'VERIFY_EMAIL')
        .where('expiresAt', '>', DateTime.now().toSQL());
      
      await Promise.all(existingTokens.map((token) => token.delete()));

      // Generate new verification token
      const token = await Token.generateVerifyEmailToken(user);
      const branding = await useBranding();

      // Try to send verification email
      try {
        await mail.send(
          new VerifyEmailNotification(user, token, {
            business: branding.business,
            siteUrl: branding.siteUrl || '',
          })
        );

        return response.json({
          success: true,
          message: 'Verification email sent successfully. Please check your inbox.',
        });
      } catch (mailError: any) {
        const detailedError = {
          code: mailError.code || 'MAIL_ERROR',
          message: mailError.message || 'Failed to send verification email',
          response: mailError.response || mailError.responseCode || null,
          command: mailError.command || null,
          details: mailError.response || mailError.message || 'Unknown error',
          stack: process.env.NODE_ENV === 'development' ? mailError.stack : undefined,
        };

        logger.error('Failed to send verification email:', {
          code: detailedError.code,
          message: detailedError.message,
          response: detailedError.response,
          command: detailedError.command,
          details: detailedError.details,
          fullError: mailError,
        });

        // Build user-friendly error message
        let userMessage = 'Failed to send verification email. ';
        if (detailedError.code === 'EAUTH') {
          userMessage += 'SMTP authentication failed. ';
          if (detailedError.response && detailedError.response.includes('SmtpClientAuthentication is disabled')) {
            userMessage += 'SMTP authentication is disabled for your email provider. Please contact your administrator or use a different email service.';
          } else {
            userMessage += 'Please check your SMTP credentials in the configuration.';
          }
        } else {
          userMessage += detailedError.details || 'Please contact support or try again later.';
        }

        return response.status(500).json({
          success: false,
          message: userMessage,
          error: detailedError,
        });
      }
    } catch (error: any) {
      logger.error('Resend Verification Error:', error);
      return response.status(500).json({
        success: false,
        message: 'An error occurred while processing your request',
      });
    }
  }

  async testSmtp({ request, response, logger }: HttpContext) {
    try {
      const { email } = request.only(['email']);

      if (!email) {
        return response.badRequest({
          success: false,
          message: 'Email address is required',
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return response.badRequest({
          success: false,
          message: 'Invalid email format',
        });
      }

      // Send test email
      const smtpEmail = env.get('SMTP_EMAIL');
      await mail.send((message) => {
        message
          .to(email)
          .from(smtpEmail, 'SMTP Test')
          .subject('SMTP Configuration Test')
          .htmlView('emails/generic_email', {
            logo: '',
            title: 'SMTP Test Email',
            body: `
              <h1>SMTP Configuration Test</h1>
              <p>This is a test email to verify your SMTP configuration is working correctly.</p>
              <p>If you received this email, your SMTP settings are configured properly!</p>
              <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>From:</strong> ${smtpEmail}</p>
            `,
            action: false,
            actionText: '',
            actionUrl: '',
          });
      });

      return response.json({
        success: true,
        message: `Test email sent successfully to ${email}. Please check your inbox.`,
      });
    } catch (error: any) {
      logger.error('SMTP Test Error:', error);
      return response.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: error.message || 'SMTP configuration error. Please check your SMTP credentials.',
      });
    }
  }
}
