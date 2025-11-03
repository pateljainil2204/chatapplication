import Createchannel from "../createchannel/createchannelmodel.js";

const searchChannel = async (req, res) => {
  try {
    const { channel } = req.params; // channel name from URL

    //  Validate input
    if (!channel) {
      return res.status(400).json({
        success: false,
        message: "Channel name (in params) is required",
      });
    }

    //  Find the channel (not soft deleted)
    const channelDoc = await Createchannel.findOne({
      channel,
      isDeleted: false,
    })
      .populate("createdBy", "username -_id")
      .populate("members", "username -_id")
      .populate("authorizedUsers", "username -_id");

    if (!channelDoc) {
      return res.status(404).json({
        success: false,
        message: `Channel '${channel}' not found or has been deleted`,
      });
    }

    // Format clean response (no createdAt or updatedAt)
    res.status(200).json({
      success: true,
      message: `Channel '${channel}' found`,
      data: {
        channel: channelDoc.channel,
        createdBy: channelDoc.createdBy.username,
        members: channelDoc.members.map((m) => m.username),
        authorizedUsers: channelDoc.authorizedUsers?.map((u) => u.username) || [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default searchChannel;