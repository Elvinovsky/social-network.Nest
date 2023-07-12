import { Controller, Delete } from '@nestjs/common';
import { DeleteDbRepository } from './delete.db.repository';

@Controller('testing')
export class DeleteDBController {
  constructor(private deleteRepo: DeleteDbRepository) {}
  @Delete('all-data')
  async deleteDB() {
    await this.deleteRepo.deleteDB();
  }
}
