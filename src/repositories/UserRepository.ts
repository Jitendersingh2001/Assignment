import mongoose from "mongoose";
import { User } from "@/models";

// function to find a user by ID
export const UserRepository = {
  findById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return User.findById(id).lean();
  },
};
