const Bookings = require("../../model/bookingModel");

const getAllBookings = async (req, res) => {
  const userId = req.user.id;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const searchQuery = req.query.searchQuery;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    let query = {
      user: userId,
    };

    if (startDate && endDate) {
      const start = moment(startDate).startOf("day").toDate();
      const end = moment(endDate).endOf("day").toDate();
      query.createdAt = { $gte: start, $lte: end };
    }

    // if (searchQuery) {
    //   query.$or = [{ description: { $regex: new RegExp(searchQuery, "i") } }];
    // } else {
    //   query.futsal = { $ne: null };
    // }

    const total = await Bookings.countDocuments(query);
    const bookingData = await Bookings.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ _id: -1 })
      .populate("futsal")
      .populate("user")
      .populate("timeSlot");

    res.status(200).json({
      success: true,
      totalCount: total,
      bookingsData: bookingData,
    });
  } catch (error) {
    console.log("Error retrieving booking data:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
    getAllBookings
}
