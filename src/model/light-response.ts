export interface LightResponse {
  [interval: string]: LightIntervalData;
}

export interface LightIntervalData {
  date: string;
  hour: string;
  'is-cheap': boolean;
  'is-under-avg': boolean;
  market: string;
  price: number;
  units: string;
}
