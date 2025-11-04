import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre(/^find/, function (next) {
  if (!this.getQuery().hasOwnProperty("isDeleted")) {
    this.where({ isDeleted: false });
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;