import mongoose from "mongoose";

const privateMessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverUsername: { type: String, required: true }, // OR receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const PrivateMessage = mongoose.model("PrivateMessage", privateMessageSchema);
export default PrivateMessage;