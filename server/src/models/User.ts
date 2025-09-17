import mongoose, { Schema, Document } from "mongoose";

export interface IRefreshToken {
  token: string;
  deviceId: string;
  ip?: string | undefined;
  userAgent?: string | undefined;
  createdAt: Date;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  refreshToken?: IRefreshToken | null; // optional because user may not be logged in yet
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  token: { type: String, required: true },
  deviceId: { type: String, required: true },
  ip: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const UserSchema: Schema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    refreshToken: { type: RefreshTokenSchema, default: null },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
