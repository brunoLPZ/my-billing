import { LightLevel } from './light-level';

export interface DbDocument {
  _id: string;
}

export interface NotificationData {
  lightLevel?: LightLevel;
  lastNotificationDate: string;
}
