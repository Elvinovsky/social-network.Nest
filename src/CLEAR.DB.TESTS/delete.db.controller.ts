import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { DeleteDbRepository } from './delete.db.repository';

@Controller('testing')
export class DeleteDBController {
  constructor(private deleteRepo: DeleteDbRepository) {}
  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDB() {
    await this.deleteRepo.deleteDB();
  }
}
