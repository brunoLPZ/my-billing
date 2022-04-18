import { JobResponse } from '../model/job-response';
import { LightLevel } from '../model/light-level';
import { OilScrapper } from '../scrapper/oil-scrapper';
import { LightService } from '../services/light-service';
import { NotificationService } from '../services/notification-service';
import { StatService } from '../services/stat-service';
import { isFirstDayOfMonth } from '../utils/general-utils';
import { Logger } from '../utils/logger';

const oilScrapper = new OilScrapper();
const notificationService = new NotificationService();
const lightServive = new LightService();
const statService = new StatService();

export async function run(context: any, _: any): Promise<JobResponse> {
  const logger: Logger = context.log;

  logger.info('Running billing job', { date: new Date() });

  try {
    const isFirstNotification =
      await notificationService.isFirstDailyNotification(logger);

    let oilPrice;

    if (isFirstNotification) {
      logger.info('First notification of the day');
      oilPrice = await oilScrapper.getOilPrice(logger);
      await notificationService.updateLastNotificationDate(logger);
      const lightAvgPrice = await lightServive.getLightPriceAverage(logger);
      logger.info('Adding oil price and light price to stats', {
        oilPrice,
        lightAvgPrice,
      });
      await statService.appendPricesToStats(
        logger,
        oilPrice.price,
        lightAvgPrice
      );
      if (isFirstDayOfMonth()) {
        logger.info(
          'First day of month, getting bill estimation from previous month'
        );
        const prices = await statService.getPricesPrevision(logger);
        if (!prices) {
          logger.error('Expected to find average prices from previous month');
        } else {
          await notificationService.sendNotification(
            logger,
            'Previsión del mes 📊',
            `Gasoil ⛽️: ${prices.oilPrice} €\nLuz 💡: ${prices.lightPrice}`
          );
        }
      }
    }

    if (oilPrice) {
      const state = oilPrice.status === 'up' ? '🔼' : '🔽';
      await notificationService.sendNotification(
        logger,
        'Precio del gasoil ⛽️',
        `Hoy el precio del gasoil ha ${state} a ${oilPrice.price} ${oilPrice.measure}`
      );
    }

    const latestLightLevel = await notificationService.getLatestLightLevel(
      logger
    );
    const currentLightState = await lightServive.getLightPriceAndLevel(logger);

    logger.info('Latest light level and current light state', {
      latestLightLevel,
      currentLightState,
    });

    if (!currentLightState) {
      logger.error('Current light status cannot be determined');
      return {
        status: 'error',
      };
    }

    if (currentLightState.level !== latestLightLevel) {
      let state;
      switch (currentLightState.level) {
        case LightLevel.GREEN:
          state = '🟢';
          break;
        case LightLevel.ORANGE:
          state = '🟠';
          break;
        default:
          state = '🔴';
      }
      await notificationService.sendNotification(
        logger,
        'Precio de la luz 💡',
        `Franja ${state}, precio ${currentLightState.price.toFixed(2)} €/kWh`
      );

      await notificationService.updateLightLevel(
        logger,
        currentLightState.level
      );
    }

    logger.info('Billing job run success');

    return {
      status: 'success',
    };
  } catch (err) {
    logger.error('Error running billing job', { err });
    return {
      status: 'error',
    };
  }
}
