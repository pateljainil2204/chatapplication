import Createchannel from "../createchannel/createchannelmodel.js";

const searchChannel = async (req, res) => {
  try {
    const { channel } = req.params;
    if (!channel) return res.status(400).json({ message: "Channel name is required" });

    const found = await Createchannel.findOne({ channel, isDeleted: false })
      .populate({ path: "createdBy", match: { isDeleted: false }, select: "username -_id" })
      .populate({ path: "members", match: { isDeleted: false }, select: "username -_id" })
      .populate({ path: "authorizedUsers", match: { isDeleted: false }, select: "username -_id" });

    if (!found)
      return res.status(404).json({ message: "Channel not found or deleted" });

    res.status(200).json({
      success: true,
      data: {
        channel: found.channel,
        createdBy: found.createdBy?.username || "Deleted User",
        members: found.members.map((m) => m.username),
        authorizedUsers: found.authorizedUsers.map((u) => u.username),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default searchChannel;