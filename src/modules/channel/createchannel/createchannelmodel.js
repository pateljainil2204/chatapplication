import mongoose from "mongoose";

const createchannelSchema = new mongoose.Schema(
  {
    channel: { type: String, required: true, unique: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Createchannel = mongoose.model("Createchannel", createchannelSchema);
export default Createchannel;