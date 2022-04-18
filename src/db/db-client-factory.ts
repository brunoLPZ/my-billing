import { MongoClient } from 'mongodb';
import { getRequiredEnv } from '../utils/general-utils';

export class DbFactory {
  private static conn: MongoClient;

  static async getConnection() {
    if (this.conn) {
      return this.conn;
    }
    this.conn = await MongoClient.connect(
      getRequiredEnv('DB_CONNECTION_STRING')
    );
    return this.conn;
  }
}
