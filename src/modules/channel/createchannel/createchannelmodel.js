import mongoose from "mongoose";

const createChannelSchema = new mongoose.Schema(
  {
    channel: { type: String, required: true, unique: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    authorizedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Createchannel = mongoose.model("Createchannel", createChannelSchema);
export default Createchannel;