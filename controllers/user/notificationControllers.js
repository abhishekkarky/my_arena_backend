const Notification = require("../../model/notificationModel");

const getAllNotification = async (req, res) => {
  try {
    const notificationData = await Notification.find({
      user: req.user.id,
    })
      .sort({ _id: -1 })
      .populate("user")
      .populate({
        path: "booking",
        populate: [{ path: "futsal" }, { path: "user" }, { path: "timeSlot" }],
      });

    res.status(200).json({
      success: true,
      notifications: notificationData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  const userId = req.user.id;
  const notificationIds = req.body.notificationIds;
  try {
    const result = await Notification.updateMany(
      { _id: { $in: notificationIds }, user: userId },
      { $set: { isRead: true } }
    );

    if (result.nModified === 0) {
      return res.status(404).json({
        success: false,
        message: "Notifications not found or not owned by the user",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


module.exports = {
  getAllNotification,
  markAllNotificationsAsRead
}