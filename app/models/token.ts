import { DateTime } from 'luxon';
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import string from '@adonisjs/core/helpers/string';
import User from '#models/user';

type TokenType = 'PASSWORD_RESET' | 'VERIFY_EMAIL';

export default class Token extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare userId: number | null;

  @column()
  declare type: string;

  @column()
  declare token: string;

  @column.dateTime()
  declare expiresAt: DateTime | null;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>;

  static async generateVerifyEmailToken(user: User) {
    const token = string.generateRandom(64);

    const record = await user.related('tokens').create({
      type: 'VERIFY_EMAIL',
      expiresAt: DateTime.now().plus({ days: 7 }),
      token,
    });

    return record.token;
  }

  static async generatePasswordResetToken(user: User | null) {
    const token = string.generateRandom(64);
    if (!user) return token;
    const record = await user.related('tokens').create({
      type: 'PASSWORD_RESET',
      expiresAt: DateTime.now().plus({ hour: 1 }),
      token,
    });

    return record.token;
  }

  public static async expireTokens(
    user: User,
    relationName: 'verifyEmailTokens' | 'passwordResetTokens'
  ) {
    await user.related(relationName).query().delete();
  }

  static async getTokenUser(token: string, type: TokenType) {
    const record = await Token.query()
      .preload('user')
      .where('token', token)
      .where('type', type)
      .where('expiresAt', '>', DateTime.now().toSQL())
      .orderBy('createdAt', 'desc')
      .first();

    return record?.user;
  }

  static async verify(token: string, type: TokenType) {
    const record = await Token.query()
      .where('expiresAt', '>', DateTime.now().toSQL())
      .where('token', token)
      .where('type', type)
      .first();

    return record;
  }
}
