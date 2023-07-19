import mongoose from 'mongoose';

declare global {
  namespace Express {
    export interface Request {
      parsedObjectId?: mongoose.Types.ObjectId;
    }
  }
}
