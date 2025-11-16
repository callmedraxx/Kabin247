import { BaseSchema } from '@adonisjs/lucid/schema';
import Roles from '../../app/enum/roles.js';

export default class extends BaseSchema {
  protected tableName = 'caterers';

  async up() {
    // This migration migrates existing caterers from users table to caterers table
    // It runs after the caterers table is created
    
    this.defer(async (db) => {
      // Get all users with DELIVERY role (roleId = 7)
      const deliveryUsers = await db
        .from('users')
        .where('role_id', Roles.DELIVERY)
        .select('*');

      if (deliveryUsers.length === 0) {
        return; // No existing caterers to migrate
      }

      // Create caterer records from users
      const caterersToInsert = deliveryUsers.map((user) => {
        // Try to find airport by address field (which stores airport.id)
        const airportId = user.address || null;

        return {
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown Caterer',
          email: user.email || null,
          phone: user.phone_number || null,
          iata_code: null, // Will be populated from Excel if available
          icao_code: null, // Will be populated from Excel if available
          time_zone: null,
          airport_id: airportId,
          is_active: !user.is_suspended ? 1 : 0,
          created_at: user.created_at || new Date(),
          updated_at: user.updated_at || new Date(),
        };
      });

      // Insert caterers and get their IDs
      const insertedIds = await db.table('caterers').insert(caterersToInsert);

      // Create a mapping of user.id -> caterer.id
      const userToCatererMap = new Map<number, number>();
      deliveryUsers.forEach((user, index) => {
        // insertedIds might be an array of IDs or a single number depending on DB
        const catererId = Array.isArray(insertedIds) ? insertedIds[index] : insertedIds;
        userToCatererMap.set(user.id, catererId);
      });

      // Update orders to use caterer_id instead of delivery_man_id
      for (const [userId, catererId] of userToCatererMap.entries()) {
        await db
          .from('orders')
          .where('delivery_man_id', userId)
          .update({ caterer_id: catererId });
      }

      // Note: We're keeping the users records for now in case they're referenced elsewhere
      // You can delete them later if needed with: DELETE FROM users WHERE role_id = 7
    });
  }

  async down() {
    // Revert: Clear caterer_id from orders
    this.defer(async (db) => {
      await db.from('orders').update({ caterer_id: null });
    });
  }
}
