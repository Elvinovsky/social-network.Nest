import { Controller, Delete } from '@nestjs/common';
import { DeleteDbRepository } from './delete.db.repository';

@Controller('testing')
export class deleteDBController {
  constructor(private deleteRepo: DeleteDbRepository) {}
  @Delete('all-data')
  async deleteDB() {
    await this.deleteRepo.deleteDB();
  }
}
