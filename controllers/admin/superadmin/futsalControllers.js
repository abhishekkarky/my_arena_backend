const Futsal = require("../../../model/futsalModel");

const getAllFutsalsForAdmin = async (req, res) => {
  const searchQuery = req.query.searchQuery;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    let query = {};

    if (searchQuery && searchQuery !== "undefined") {
      const regex = new RegExp(searchQuery, "i");
      query.name = regex || "";
    }

    if (startDate && endDate) {
      const start = moment(startDate).startOf("day").toDate();
      const end = moment(endDate).endOf("day").toDate();
      query.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    const futsals = await Futsal.find()
      .populate("timeSlots")
      .limit(limit)
      .skip(skip)
      .sort({ _id: -1 });

    const total = await Futsal.countDocuments(query);

    res.status(200).json({
      success: true,
      futsals: futsals,
      totalCount: total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { getAllFutsalsForAdmin };
