import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction } from 'express';
import mongoose from 'mongoose';
//todo
@Injectable()
export class ObjectIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { id } = req['params'];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException([
        { field: 'blogId', message: 'blogId invalid' },
      ]);
    }
    req['parsedObjectId'] = new mongoose.Types.ObjectId(id);
    next();
  }
}
