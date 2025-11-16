import errorHandler from '#exceptions/error_handler';
import BusinessSetup from '#models/business_setup';
import Setting from '#models/setting';
import {
  businessInfoValidator,
  platformSetupValidator,
  siteSettingValidator,
} from '#validators/business_setup';
import type { HttpContext } from '@adonisjs/core/http';
import { attachmentManager } from '@jrmc/adonis-attachment';

export default class BusinessSetupsController {
  async getDetail({ logger, response }: HttpContext) {
    try {
      const data = await BusinessSetup.query().firstOrFail();
      const branding = await Setting.query().where('key', 'branding').firstOrFail();
      return response.json({ ...data.serialize(), siteUrl: branding.value1 });
    } catch (error) {
      errorHandler(error, response, logger, 'Get Business Info Error');
    }
  }

  async updateBusinessInfo({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(businessInfoValidator);
      const businessSetup = await BusinessSetup.query().firstOrFail();
      const branding = await Setting.query().where('key', 'branding').firstOrFail();
      branding.value1 = payload.siteUrl || '';
      await branding.save();
      delete payload.siteUrl;
      await businessSetup.merge(payload).save();
      return response.created({
        success: true,
        message: 'Info updated successfully',
        content: businessSetup,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating Business Info Error');
    }
  }

  async updatePlatformSetup({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(platformSetupValidator);
      const businessSetup = await BusinessSetup.query().firstOrFail();
      await businessSetup.merge(payload).save();
      return response.created({
        success: true,
        message: 'Platform info updated successfully',
        content: businessSetup,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating Platform Setup Error');
    }
  }

  async updateSiteSetting({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(siteSettingValidator);
      const { logo, minimizedLogo, favicon, aboutUsImage, contactUsImage, ...restPayload } =
        payload;
      const siteSetting = await BusinessSetup.query().firstOrFail();
      siteSetting.merge(restPayload);
      if (logo) {
        siteSetting.logo = await attachmentManager.createFromFile(logo);
      }
      if (minimizedLogo) {
        siteSetting.minimizedLogo = await attachmentManager.createFromFile(minimizedLogo);
      }
      if (favicon) {
        siteSetting.favicon = await attachmentManager.createFromFile(favicon);
      }
      if (aboutUsImage) {
        siteSetting.aboutUsImage = await attachmentManager.createFromFile(aboutUsImage);
      }
      if (contactUsImage) {
        siteSetting.contactUsImage = await attachmentManager.createFromFile(contactUsImage);
      }

      await siteSetting.save();
      return response.created({
        success: true,
        message: 'Site setting updated successfully',
        content: siteSetting,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating Site Setting Error');
    }
  }
}
