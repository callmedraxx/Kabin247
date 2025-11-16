import notificationErrorHandler from '#exceptions/notification_error_handler';
import Notification from '#models/notification';
import User from '#models/user';
import transmit from '@adonisjs/transmit/services/main';
import Roles from '../enum/roles.js';
import Order from '#models/order';
import Reservation from '#models/reservation';

class NotificationService {
  constructor() {}
  async sendNewRegistraionNotification(user: User) {
    try {
      const admins = await User.query().whereIn('roleId', [Roles.ADMIN, Roles.MANAGER, Roles.POS]);
      admins.forEach(async (admin) => {
        const notification = await Notification.create({
          userId: admin.id,
          title: 'New Registration',
          body: `A new customer has create an account. User id #${user.id}`,
          type: 'new_registration',
          navigate: `/${getRoleRoute(admin.roleId)}/customers`,
        });
        transmit.broadcast(`users/${admin.id}`, notification.serialize());
      });
    } catch (err) {
      notificationErrorHandler(err, 'sendNewRegistraionNotification Error');
    }
  }

  async sendNewOrderNotification(user: User, order: Order) {
    try {
      const admins = await User.query().whereIn('roleId', [Roles.ADMIN, Roles.MANAGER, Roles.POS]);
      admins.forEach(async (admin) => {
        if (admin.id === user.id) return;
        const notification = await Notification.create({
          userId: admin.id,
          title: 'New Order',
          body: `A new order has been placed by userId #${user.id} . Order number #${order.orderNumber}`,
          type: 'new_order',
          navigate: `/${getRoleRoute(admin.roleId)}/active-orders`,
        });
        transmit.broadcast(`users/${admin.id}`, notification.serialize());
      });
    } catch (err) {
      notificationErrorHandler(err, 'sendNewOrderNotification Error');
    }
  }

  async sendOrderStatusNotification(order: Order) {
    try {
      if (order.userId) {
        const notification = await Notification.create({
          userId: order.userId,
          title: 'Order Status Update',
          body: `Order number ${order.orderNumber} is ${order.status}`,
          type: 'order_status',
          navigate: '/user/my-orders',
        });
        transmit.broadcast(`users/${order.userId}`, notification.serialize());
      }
    } catch (err) {
      notificationErrorHandler(err, 'sendOrderStatusNotification Error');
    }
  }
  async sendDeliveryManAssignedNotification(order: Order) {
    try {
      if (order.userId && order.deliveryManId) {
        const notification = await Notification.create({
          userId: order.userId,
          title: 'Delivery Man Assigned',
          body: `A delivery man has been assigned for your order number ${order.orderNumber}`,
          type: 'delivery_man_assigned',
          navigate: '/user/my-orders',
        });
        transmit.broadcast(`users/${order.userId}`, notification.serialize());
      }
    } catch (err) {
      notificationErrorHandler(err, 'sendDeliveryManAssignedNotification Error');
    }
  }

  async sendUserSuspentionNotification(user: User, AdminUser: User) {
    try {
      const admins = await User.query().whereIn('roleId', [Roles.ADMIN, Roles.MANAGER, Roles.POS]);
      admins.forEach(async (admin) => {
        if (admin.id === AdminUser.id) return;
        const notification = await Notification.create({
          userId: admin.id,
          title: 'User Suspention',
          body: `User #${user.id} has been suspended by #${AdminUser.id}`,
          type: 'user_suspention',
          navigate: `/${getRoleRoute(admin.roleId)}/customers`,
        });
        transmit.broadcast(`users/${admin.id}`, notification.serialize());
      });
    } catch (err) {
      notificationErrorHandler(err, 'sendUserSuspentionNotification Error');
    }
  }

  async sendCreateReservationNotification(reservation: Reservation, AdminUser: User) {
    try {
      const admins = await User.query().whereIn('roleId', [Roles.ADMIN, Roles.MANAGER, Roles.POS]);
      admins.forEach(async (admin) => {
        if (admin.id === AdminUser.id) return;
        const notification = await Notification.create({
          userId: admin.id,
          title: 'New Reservation',
          body: `User #${AdminUser.id} has create a reservation for user #${reservation.userId}. Reservation Id: #${reservation.id} `,
          type: 'new_reservation',
          navigate: '/admin/active-reservations',
        });
        transmit.broadcast(`users/${admin.id}`, notification.serialize());
      });
    } catch (err) {
      notificationErrorHandler(err, 'sendCreateReservationNotification Error');
    }
  }

  async sendReservationStatusUpdateNotification(reservation: Reservation, AdminUser: User) {
    try {
      const admins = await User.query().whereIn('roleId', [Roles.ADMIN, Roles.MANAGER, Roles.POS]);
      admins.forEach(async (admin) => {
        if (admin.id === AdminUser.id) return;
        const notification = await Notification.create({
          userId: admin.id,
          title: 'Reservation Status Update',
          body: `Reservation Id: #${reservation.id} is ${reservation.status}`,
          type: 'reservation_status',
          navigate: `/${getRoleRoute(admin.roleId)}/reservation-history`,
        });
        transmit.broadcast(`users/${admin.id}`, notification.serialize());
      });
    } catch (err) {
      notificationErrorHandler(err, 'sendReservationStatusUpdateNotification Error');
    }
  }
}

const getRoleRoute = (role: number) => {
  switch (role) {
    case Roles.ADMIN:
      return 'admin';
    case Roles.MANAGER:
      return 'manager';
    case Roles.POS:
      return 'pos';
    default:
      return 'admin';
  }
};

export default new NotificationService();
