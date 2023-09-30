import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ClearMongoRepository } from './clear-mongo.repository';

@Controller('testing')
export class ClearDBController {
  constructor(private deleteRepo: ClearMongoRepository) {}
  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDB() {
    await this.deleteRepo.deleteDB();
  }
}
