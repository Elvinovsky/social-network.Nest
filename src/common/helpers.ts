import mongoose from 'mongoose';

export const objectIdHelper = (id) => new mongoose.Types.ObjectId(id);
