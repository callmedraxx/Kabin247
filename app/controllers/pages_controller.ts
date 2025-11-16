import BusinessSetup from '#models/business_setup';
import Category from '#models/category';
import MenuItem from '#models/menu_item';
import OrderItem from '#models/order_item';
import Promotion from '#models/promotion';
import type { HttpContext } from '@adonisjs/core/http';

export default class PagesController {
  private async mostPopularItems(limit: number) {
    const popularMenuItems = await OrderItem.query()
      .select('menuItemId')
      .count('* as orderCount')
      .groupBy('menuItemId')
      .orderBy('orderCount', 'desc')
      .limit(limit);

    const menuItemIds = popularMenuItems.map((item) => item.menuItemId);

    const menuItems = await MenuItem.query()
      .whereIn('id', menuItemIds)
      .preload('category', (query) => {
        query.where('isAvailable', true);
      })
      .preload('variants', (query) => {
        query.where('isAvailable', true).preload('variantOptions');
      })
      .preload('charges', (query) => {
        query.where('isAvailable', true);
      })
      .preload('addons', (query) => {
        query.where('isAvailable', true);
      });

    return menuItems.map((menuItem) => {
      const orderCount =
        popularMenuItems.find((item) => item.menuItemId === menuItem.id)?.$extras.orderCount || 0;
      return { menuItem, orderCount };
    });
  }
  async customerHome({ inertia }: HttpContext) {
    const data = await Promotion.query().where('type', 'slider');
    const businessSetup = await BusinessSetup.firstOrFail();
    const orderBy = businessSetup.sortCategories === 'priority_number' ? 'priority' : 'name';
    const dataQuery = await Category.query()
      .where('isAvailable', true)
      .preload('menuItems', (query) => {
        query.where('isAvailable', true);
      })
      .orderBy(orderBy, 'asc');
    const dataQueryMenuItems = await MenuItem.query()
      .where('isAvailable', true)
      .preload('category', (query) => {
        query.where('isAvailable', true);
      })
      .preload('variants', (query) => {
        query.where('isAvailable', true).preload('variantOptions');
      })
      .preload('charges', (query) => {
        query.where('isAvailable', true);
      })
      .preload('addons', (query) => {
        query.where('isAvailable', true);
      })
      .orderBy('createdAt', 'desc')
      .limit(10);
    return inertia.render('Customer/Home', {
      slider: {
        content: data.map((ele) =>
          ele.serialize({ fields: { pick: ['id', 'type', 'sliderImage'] } })
        ),
      },
      categories: dataQuery?.map((ele) => ele.serialize()),
      popular: await this.mostPopularItems(5),
      latest: dataQueryMenuItems,
    });
  }
}
