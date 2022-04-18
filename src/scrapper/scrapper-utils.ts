import axios from 'axios';
import { CheerioAPI, load } from 'cheerio';

export async function initializeScrapper(url: string): Promise<CheerioAPI> {
  const response = await axios.get(url);
  return load(response.data);
}

export function convertIntervalNumberToDate(number: string): string {
  return new Date(new Date().setHours(+number, 0, 0, 0)).toISOString();
}
