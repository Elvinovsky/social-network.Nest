import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { IClearRepository } from '../infrastructure/repositoriesModule/repositories.module';

@Controller('testing')
export class ClearDBController {
  constructor(private deleteRepo: IClearRepository) {}
  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDB() {
    await this.deleteRepo.deleteDB();
  }
}
