import mongoose from "mongoose";
import { IUser } from "../types/index.js";

const userSchema = new mongoose.Schema<IUser>({
    name : {type: String, required: true},
    email : {type: String,unique: true, required: true},
    clerkId : {type: String, unique: true, sparse: true},
    image: {type: String},
    role: {type: String,enum: ["user", "admin"], default: "user"},
},
{
    timestamps: true
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;