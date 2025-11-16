import { DateTime } from 'luxon';
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm';
import { generateUniqueOrderNumber } from '../utils/generate_unique_id.js';
import OrderItem from '#models/order_item';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import { Filterable } from 'adonis-lucid-filter';
import { compose } from '@adonisjs/core/helpers';
import OrderFilter from '#models/filters/order_filter';
import User from '#models/user';
import formatPrecision from '../utils/format_precision.js';
import OrderCharge from '#models/order_charge';
import Airport from '#models/airport';
import Caterer from '#models/caterer';

export default class Order extends compose(BaseModel, Filterable) {
  static $filter = () => OrderFilter;

  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare orderNumber: string;

  @column()
  declare userId: number | null;

  @column()
  declare type: 'dine_in' | 'delivery' | 'pickup';

  @column()
  declare totalQuantity: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare total: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare totalTax: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare totalCharges: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare discount: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare manualDiscount: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare deliveryCharge: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare grandTotal: number;

  @column()
  declare paymentType: 'cash' | 'card' | 'paypal' | 'stripe';

  @column()
  declare paymentStatus:
    | 'unpaid'
    | 'payment_requested'
    | 'paid';

  @column()
  declare paymentInfo: string | null;

  @column()
  declare customerNote: string | null;

  @column()
  declare note: string | null;

  @column()
  declare packagingNote: string | null;

  @column()
  declare dietaryRes: string | null;

  @column()
  declare reheatMethod: string | null;

  @column()
  declare tailNumber: string | null;

  @column()
  declare deliveryDate: string | null;

  @column()
  declare deliveryTime: string | null;

  @column()
  declare priority: string | null;

  @column()
  declare status:
    | 'quote_pending'
    | 'quote_sent'
    | 'awaiting_vendor_quote'
    | 'awaiting_vendor_confirmation'
    | 'vendor_confirmed'
    | 'awaiting_client_confirmation'
    | 'client_confirmed'
    | 'out_for_delivery'
    | 'completed'
    | 'cancelled_not_billable'
    | 'cancelled_billable';

  @column()
  declare deliveryManId: number | null;

  @column()
  declare catererId: number | null;

  @column()
  declare deliveryAirportId: number | null;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare vendorCost: number;


  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>;

  @belongsTo(() => User, { foreignKey: 'deliveryManId' })
  declare deliveryMan: BelongsTo<typeof User>;

  @belongsTo(() => Caterer, { foreignKey: 'catererId' })
  declare caterer: BelongsTo<typeof Caterer>;

  @belongsTo(() => Airport, { foreignKey: 'deliveryAirportId' })
  declare deliveryAirport: BelongsTo<typeof Airport>;

  @hasMany(() => OrderItem)
  declare orderItems: HasMany<typeof OrderItem>;

  @hasMany(() => OrderCharge)
  declare orderCharges: HasMany<typeof OrderCharge>;

  @beforeCreate()
  static async assignOrderNumber(order: Order) {
    order.orderNumber = await generateUniqueOrderNumber();
  }
}
