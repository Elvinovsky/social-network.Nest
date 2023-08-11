import { PipeTransform, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value !== 'object') {
      return value;
    }
    Object.keys(value).forEach((el) => {
      return (value[el] =
        typeof value[el] === 'string' ? value[el].trim() : value[el]);
    });
    return value;
  }
}

export class ObjectIdPipe implements PipeTransform {
  transform(value: string): string | false {
    if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
      return value;
    }
    return false;
  }
}
