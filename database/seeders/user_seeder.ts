import { BaseSeeder } from '@adonisjs/lucid/seeders';
import Roles from '../../app/enum/roles.js';
import User from '#models/user';

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await User.createMany([
      {
        firstName: 'Test',
        lastName: 'Admin',
        email: 'admin@test.com',
        password: '12345678',
        roleId: Roles.ADMIN,
        isEmailVerified: true,
        phoneNumber: '+8801232332',
      },
      {
        firstName: 'Test',
        lastName: 'Manager',
        email: 'manager@test.com',
        password: '12345678',
        roleId: Roles.MANAGER,
        isEmailVerified: true,
        phoneNumber: '+8801232332',
      },
      {
        firstName: 'Test',
        lastName: 'POS',
        email: 'pos@test.com',
        password: '12345678',
        roleId: Roles.POS,
        isEmailVerified: true,
        phoneNumber: '+8801232332',
      },
      {
        firstName: 'Test',
        lastName: 'Display',
        email: 'display@test.com',
        password: '12345678',
        roleId: Roles.DISPLAY,
        isEmailVerified: true,
        phoneNumber: '+8801232332',
      },
      {
        firstName: 'Test',
        lastName: 'Kitchen',
        email: 'kitchen@test.com',
        password: '12345678',
        roleId: Roles.KITCHEN,
        isEmailVerified: true,
        phoneNumber: '+8801232332',
      },
      {
        firstName: 'Test',
        lastName: 'Customer',
        email: 'customer@test.com',
        password: '12345678',
        roleId: Roles.CUSTOMER,
        isEmailVerified: true,
        phoneNumber: '+8801232332',
      },
    ]);
  }
}
