import mongoose from "mongoose";
import { User } from "@/models";

export const UserRepository = {
  findById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return User.findById(id).lean();
  },
};
