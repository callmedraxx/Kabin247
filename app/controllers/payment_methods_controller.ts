import errorHandler from '#exceptions/error_handler';
import BusinessSetup from '#models/business_setup';
import PaymentMethod from '#models/payment_method';
import { customUpdateValidator, paymentMethodValidator } from '#validators/payment_method';
import type { HttpContext } from '@adonisjs/core/http';
import { attachmentManager } from '@jrmc/adonis-attachment';

export default class PaymentMethodsController {
  async adminView({ logger, response, inertia }: HttpContext) {
    try {
      const data = await PaymentMethod.query().orderBy('createdAt', 'desc');
      return inertia.render('Admin/PaymentMethods', { data });
    } catch (error) {
      errorHandler(error, response, logger, 'View PaymentMethods Error');
    }
  }
  async index({ logger, request, response }: HttpContext) {
    const { page, limit, ...input } = request.qs();
    try {
      const businessSetup = await BusinessSetup.query().firstOrFail();
      const { country, currencyCode } = businessSetup;
      const data = await PaymentMethod.filter(input)
        .where('status', true)
        .if(country, (query) =>
          query.whereRaw('JSON_CONTAINS(countries, ?)', [JSON.stringify(country?.toUpperCase())])
        )
        .if(currencyCode, (query) =>
          query.whereRaw('JSON_CONTAINS(currencies, ?)', [
            JSON.stringify(currencyCode.toUpperCase()),
          ])
        )
        .orderBy('createdAt', 'desc');
      const content = data.map((ele) =>
        ele.serialize({
          fields: {
            pick: ['id', 'name', 'key', 'status', 'logo'],
          },
        })
      );
      return response.json({ content });
    } catch (error) {
      errorHandler(error, response, logger, 'Index PaymentMethods Error');
    }
  }

  async getById({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const businessSetup = await BusinessSetup.query().firstOrFail();
      const { country, currencyCode } = businessSetup;
      const data = await PaymentMethod.query()
        .where('id', id)
        .if(country, (query) =>
          query.whereRaw('JSON_CONTAINS(countries, ?)', [JSON.stringify(country?.toUpperCase())])
        )
        .if(currencyCode, (query) =>
          query.whereRaw('JSON_CONTAINS(currencies, ?)', [
            JSON.stringify(currencyCode.toUpperCase()),
          ])
        )
        .andWhere('status', true)
        .firstOrFail();
      const content = data.serialize({
        fields: {
          pick: ['id', 'name', 'key', 'status', 'logo'],
        },
      });
      return response.json({ content });
    } catch (error) {
      errorHandler(error, response, logger, 'Get By Id Error');
    }
  }

  async adminIndex({ logger, request, response }: HttpContext) {
    const { page, limit, ...input } = request.qs();
    try {
      const data = await PaymentMethod.filter(input).orderBy('createdAt', 'desc');
      return response.json({ content: data });
    } catch (error) {
      errorHandler(error, response, logger, 'Index PaymentMethods Error');
    }
  }

  async getDetails({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const data = await PaymentMethod.query().where('id', id).firstOrFail();
      return response.json({ content: data });
    } catch (error) {
      errorHandler(error, response, logger, 'Get By Id Error');
    }
  }

  async store({ logger, request, response }: HttpContext) {
    try {
      const { logo, ...restPayload } = request.all();
      const exist = await PaymentMethod.findBy('key', restPayload.key);
      if (exist) {
        return response.badRequest({ success: false, message: 'This key already exist!' });
      }
      const proccessedLogo = logo ? await attachmentManager.createFromFile(logo) : null;
      const paymentMethod = await PaymentMethod.create({ logo: proccessedLogo, ...restPayload });

      return response.created({
        success: true,
        message: 'PaymentMethod created successfully',
        content: paymentMethod,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Storing paymentMethod Error');
    }
  }

  async update({ logger, request, response, params }: HttpContext) {
    try {
      const paymentMethod = await PaymentMethod.findOrFail(params.id);
      const payload = await request.validateUsing(paymentMethodValidator);
      const { logo, ...restPayload } = payload;
      await paymentMethod.merge(restPayload);

      if (logo) {
        const proccessedLogo = await attachmentManager.createFromFile(logo);
        paymentMethod.logo = proccessedLogo;
      }
      await paymentMethod.save();

      return response.ok({
        success: true,
        message: 'PaymentMethod updated successfully',
        content: paymentMethod,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating paymentMethod Error');
    }
  }

  async customUpdate({ logger, request, response, params }: HttpContext) {
    try {
      const payload = await request.validateUsing(customUpdateValidator);
      const paymentMethods = await PaymentMethod.findOrFail(params.id);
      await paymentMethods.merge(payload).save();

      return response.ok({
        success: true,
        message: 'Changes saved successfully.',
        content: paymentMethods,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Custom Update error');
    }
  }

  async delete({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const data = await PaymentMethod.findOrFail(id);
      await data.delete();
      return response.json({ success: true, message: 'PaymentMethod deleted successfully' });
    } catch (error) {
      errorHandler(error, response, logger, 'Deleting error');
    }
  }
}
