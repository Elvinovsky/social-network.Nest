import { PipeTransform, Injectable } from '@nestjs/common';

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
