import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ParamObjectId {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}
