import { OilPrice } from '../model/oil-price';
import { removeTabsAndNewLines } from '../utils/general-utils';
import { Logger } from '../utils/logger';
import { initializeScrapper } from './scrapper-utils';

const OIL_URL = 'https://www.dieselogasolina.com/';
const OIL_PRICE_COLUMN =
  '.tabla_resumen_precios tr:contains("Gasóleo C") td:nth-child(2)';
const OIL_UP_CLASS = 'sube';

export class OilScrapper {
  async getOilPrice(log: Logger): Promise<OilPrice> {
    log.info('Getting old price');
    const $ = await initializeScrapper(OIL_URL);
    const priceColumn = $(OIL_PRICE_COLUMN);
    const price = removeTabsAndNewLines(priceColumn.text());
    const priceStatus = priceColumn.hasClass(OIL_UP_CLASS) ? 'up' : 'down';
    log.info('Oil info', { price, priceStatus });
    const priceParts = price.split(' ');
    return {
      price: +priceParts[0].replace(',', '.'),
      measure: priceParts[1],
      status: priceStatus,
    };
  }
}
