import { Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';
import { isUUID } from 'class-validator';

@Injectable()
export class ObjectIdPipe implements PipeTransform {
  transform(value: string): string | false {
    if (Types.ObjectId.isValid(value)) {
      return value;
    }
    return false;
  }
}

@Injectable()
export class ParamUUIdPipe implements PipeTransform {
  transform(value: string): string | null {
    if (isUUID(value)) {
      return value;
    }
    return null;
  }
}
