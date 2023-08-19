import { Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ObjectIdPipe implements PipeTransform {
  transform(value: string): string | false {
    if (Types.ObjectId.isValid(value)) {
      return value;
    }
    return false;
  }
}
