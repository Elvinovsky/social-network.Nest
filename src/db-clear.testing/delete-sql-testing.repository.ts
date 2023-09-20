import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DeleteDbSQLRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async deleteDB() {
    await this.dataSource.query(`
    DELETE FROM "features"."posts"
    `);
    await this.dataSource.query(`
    DELETE FROM "features"."blogs"
    `);
    await this.dataSource.query(`
    DELETE FROM "user"."banInfo"
    `);
    await this.dataSource.query(`
    DELETE FROM "user"."emailConfirmation"
    `);
    await this.dataSource.query(`
    DELETE FROM "devices"."sessions"
    `);
    await this.dataSource.query(`
    DELETE FROM "user"."accountData"
    `);
  }
}
