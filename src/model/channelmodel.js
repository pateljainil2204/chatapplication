import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
  channel: { type: String, required: true, unique: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Channel = mongoose.model("Channel", channelSchema);
export default Channel;
