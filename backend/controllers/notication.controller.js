import Notification from "../models/notification.model.js";

export const getUserNotifications = async (req, res) => {
  try {
    const notication = await Notification.find({
      recipient: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("relatedUser", "name username profilePicture")
      .populate("relatedPost", "content image");

    res.status(200).json(notication);
  } catch (error) {
    console.error(`error in getUserNotification ${error}`);
    res.status(500).json({ message: "server error" });
  }
};

export const markNotificationAsRead = async (req, res) => {
  const notificationID = req.params.id;
  try {
    const notication = await Notification.findByIdAndUpdate(notificationID, {
      _id: notificationID,
      recipient: req.user._id,
      read: true,
      new: true,
    });

    res.status(200).json(notication);
  } catch (error) {
    console.error(`error in markNotificationAsRead controller ${error}`);
    res.status(500).json({ message: "server error" });
  }
};

export const deleteNotification = async (req, res) => {
  const notificationID = req.params.id;
  try {
    await Notification.findByIdAndDelete({
      _id: notificationID,
      recipient: req.user._id,
    });
    res.status(200).json({ message: "notication deleted successfully" });
  } catch (error) {
    console.error(`error in deleteNotification controller ${error}`);
    res.status(500).json({ message: "server error" });
  }
};
