import got from 'got/dist/source';
import { DbClient } from '../db/db-client';
import { LightLevel } from '../model/light-level';
import { getEnv, getRequiredEnv, isYesterday } from '../utils/general-utils';
import { Logger } from '../utils/logger';

const PUSHBULLET_URL = 'https://api.pushbullet.com/v2';
const PUSHBULLET_TOKEN = getRequiredEnv('PUSHBULLET_TOKEN');

export class NotificationService {
  private dbClient: DbClient;
  constructor() {
    this.dbClient = new DbClient();
  }

  async isFirstDailyNotification(log: Logger): Promise<boolean> {
    const lastNotificationDate = await this.dbClient.getLastNotificationDate();
    log.info('Checking for first daily notification', {
      lastNotificationDate,
    });
    if (!lastNotificationDate) {
      return true;
    }
    return isYesterday(lastNotificationDate);
  }

  async updateLastNotificationDate(log: Logger): Promise<void> {
    log.info('Updating last notification date');
    await this.dbClient.updateLastNotificationDate();
  }

  async getLatestLightLevel(log: Logger): Promise<LightLevel | undefined> {
    log.info('Getting latest light level');
    return await this.dbClient.getLightLevel();
  }

  async updateLightLevel(log: Logger, level: LightLevel): Promise<void> {
    log.info('Updating light level', { level });
    await this.dbClient.updateLightLevel(level);
  }

  async sendNotification(
    log: Logger,
    title: string,
    content: string
  ): Promise<void> {
    if (getEnv('NOTIFICATION_DISABLED') === 'true') {
      log.warn('Notifications are disabled', { title, content });
      return;
    }
    log.info('Sending notification', { title, content });
    await got
      .post(`${PUSHBULLET_URL}/pushes`, {
        headers: { 'Access-Token': PUSHBULLET_TOKEN },
        json: {
          type: 'note',
          title,
          body: content,
        },
      })
      .json();
  }
}
