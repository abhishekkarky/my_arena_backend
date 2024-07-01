const users = require("../model/userModel");
const ensureSuperAdmin = async (req, res, next) => {
  const userDetail = await users.findById(req.user.id);
  if (userDetail && userDetail.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "You are not authorized to perform this action",
    });
  }
};

module.exports = ensureSuperAdmin;
