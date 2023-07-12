import mongoose from 'mongoose';

export const objectIdHelper = (id: string) => new mongoose.Types.ObjectId(id);
