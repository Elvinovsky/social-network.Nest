import mongoose from 'mongoose';
import { CookieOptions } from 'express';

export const objectIdHelper = (id: string) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
};

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'none',
  secure: true,
};
