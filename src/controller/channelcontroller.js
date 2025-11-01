import Channel from "../model/channelmodel.js";

const getGroupMembers = async (req, res) => {
  try {
    const { channelName } = req.params;

    const channel = await Channel.findOne({ channel: channelName })
      .populate("members", "username -_id"); // only username field

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    const members = channel.members.map((user) => user.username);

    res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default getGroupMembers;