import mongoose from 'mongoose';

export const objectId = (id) => new mongoose.Types.ObjectId(id);
