const { populate } = require("dotenv");
const Notification = require("../../../model/notificationModel");
const moment = require("moment");

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

const notificationCountAndGrowthRate = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
    });

    const previousMonthStart = moment()
      .subtract(1, "months")
      .startOf("month")
      .toDate();
    const previousMonthEnd = moment()
      .subtract(1, "months")
      .endOf("month")
      .toDate();

    const currentMonthStart = moment().startOf("month").toDate();
    const currentMonthEnd = moment().endOf("month").toDate();

    const previousMonthCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
      createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
    });

    const currentMonthCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });

    const growthRate =
      ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;

    res.status(200).json({
      success: true,
      message: "Count and growth of notification fetched successfully",
      count: count,
      growth: growthRate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  notificationCountAndGrowthRate,
  getAllNotification,
  markAllNotificationsAsRead,
};
