import got from 'got/dist/source';
import { LightLevel } from '../model/light-level';
import { LightResponse } from '../model/light-response';
import { Logger } from '../utils/logger';

const LIGHT_API_URL = 'https://api.preciodelaluz.org/v1';

export class LightService {
  async getLightPriceAndLevel(
    log: Logger
  ): Promise<{ price: number; level: LightLevel } | undefined> {
    const url = `${LIGHT_API_URL}/prices/all`;
    const lightResponse = await got(url, {
      searchParams: { zone: 'PCB' },
    }).json<LightResponse>();
    const today = new Date().getTime();
    for (const interval of Object.keys(lightResponse)) {
      const intervalParts = interval.split('-');
      const intervalStart = new Date().setHours(+intervalParts[0], 0, 0, 0);
      const intervalEnd = new Date().setHours(+intervalParts[1], 0, 0, 0);
      if (intervalStart <= today && intervalEnd >= today) {
        log.info('Light interval found', { interval: lightResponse[interval] });
        const price = lightResponse[interval].price / 1000;
        let level;
        if (
          lightResponse[interval]['is-cheap'] &&
          lightResponse[interval]['is-under-avg']
        ) {
          level = LightLevel.GREEN;
        } else if (lightResponse[interval]['is-under-avg']) {
          level = LightLevel.ORANGE;
        } else {
          level = LightLevel.RED;
        }
        return {
          price,
          level,
        };
      }
    }
  }

  async getLightPriceAverage(log: Logger): Promise<number> {
    log.info('Getting light price average');
    const url = `${LIGHT_API_URL}/prices/all`;
    const lightResponse = await got(url, {
      searchParams: { zone: 'PCB' },
    }).json<LightResponse>();
    let priceSum = 0;
    for (const interval of Object.keys(lightResponse)) {
      const price = lightResponse[interval].price / 1000;
      priceSum += price;
    }
    return priceSum / Object.keys(lightResponse).length;
  }
}
