import { LightLevel } from '../model/light-level';
import { NotificationData } from '../model/notification';
import {
  getRequiredEnv,
  getYesterdayDate,
  hashToSha256,
} from '../utils/general-utils';
import { DbFactory } from './db-client-factory';

const NOTIFICATION_COLLECTION = 'notifications';
const STAT_COLLECTION = 'stats';
const DB = getRequiredEnv('DB_NAME');

export class DbClient {
  async getLastNotificationDate(): Promise<string | undefined> {
    const conn = await DbFactory.getConnection();
    const result = await conn
      .db(DB)
      .collection(NOTIFICATION_COLLECTION)
      .findOne<NotificationData>({ lastNotificationDate: { $exists: true } });
    return result?.lastNotificationDate;
  }

  async getLightLevel(): Promise<LightLevel | undefined> {
    const conn = await DbFactory.getConnection();
    const result = await conn
      .db(DB)
      .collection(NOTIFICATION_COLLECTION)
      .findOne<NotificationData>({ lastNotificationDate: { $exists: true } });
    return result?.lightLevel;
  }

  async updateLightLevel(level: LightLevel): Promise<void> {
    const conn = await DbFactory.getConnection();
    await conn
      .db(DB)
      .collection(NOTIFICATION_COLLECTION)
      .updateOne(
        { lastNotificationDate: { $exists: true } },
        {
          $set: {
            lightLevel: level,
          },
        }
      );
  }

  async updateLastNotificationDate(): Promise<void> {
    const conn = await DbFactory.getConnection();
    await conn
      .db(DB)
      .collection(NOTIFICATION_COLLECTION)
      .updateOne(
        { lastNotificationDate: { $exists: true } },
        {
          $set: {
            lastNotificationDate: new Date().toISOString(),
          },
        }
      );
  }

  async appendOilPriceToStats(price: number): Promise<void> {
    const date = new Date();
    const [month, year] = [date.getMonth(), date.getFullYear()];
    const statId = hashToSha256(`${month}-${year}`);
    const conn = await DbFactory.getConnection();
    await conn
      .db(DB)
      .collection(STAT_COLLECTION)
      .updateOne(
        { _id: statId },
        { $push: { oilPrices: price }, $setOnInsert: { _id: statId } },
        { upsert: true }
      );
  }

  async appendLightPriceToStats(price: number): Promise<void> {
    const date = new Date();
    const [month, year] = [date.getMonth(), date.getFullYear()];
    const statId = hashToSha256(`${month}-${year}`);
    const conn = await DbFactory.getConnection();
    await conn
      .db(DB)
      .collection(STAT_COLLECTION)
      .updateOne(
        { _id: statId },
        { $push: { lightPrices: price }, $setOnInsert: { _id: statId } },
        { upsert: true }
      );
  }

  async getPreviousMonthPriceStats(): Promise<{
    oilPrices: number[];
    lightPrices: number[];
  } | null> {
    const date = getYesterdayDate();
    const [month, year] = [date.getMonth(), date.getFullYear()];
    const statId = hashToSha256(`${month}-${year}`);
    const conn = await DbFactory.getConnection();
    const priceData = await conn
      .db(DB)
      .collection(STAT_COLLECTION)
      .findOne<{ oilPrices: number[]; lightPrices: number[] }>({ _id: statId });
    return priceData;
  }
}
