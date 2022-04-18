import { DbClient } from '../db/db-client';
import {
  calculateAverage,
  getDaysInPreviousMonth,
} from '../utils/general-utils';
import { Logger } from '../utils/logger';

const DAYLY_OIL_CONSUM = 10;
const DAYLY_LIGHT_CONSUM = 9;

export class StatService {
  private dbClient: DbClient;
  constructor() {
    this.dbClient = new DbClient();
  }

  async appendPricesToStats(
    log: Logger,
    oilPrice: number,
    lightPrice: number
  ): Promise<void> {
    log.info('Appending prices to stats', { oilPrice, lightPrice });
    await this.dbClient.appendOilPriceToStats(oilPrice);
    await this.dbClient.appendLightPriceToStats(lightPrice);
  }

  async getPricesPrevision(log: Logger): Promise<
    | {
        oilPrice: number;
        lightPrice: number;
      }
    | undefined
  > {
    log.info('Getting price stats of previous month');
    const priceStats = await this.dbClient.getPreviousMonthPriceStats();
    if (!priceStats) {
      return;
    }
    return {
      oilPrice:
        calculateAverage(priceStats.oilPrices) *
        DAYLY_OIL_CONSUM *
        getDaysInPreviousMonth(),
      lightPrice:
        calculateAverage(priceStats.lightPrices) *
        DAYLY_LIGHT_CONSUM *
        getDaysInPreviousMonth(),
    };
  }
}
