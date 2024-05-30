const jwt = require('jsonwebtoken')

const authGuard = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.json({
            success : false,
            message : "User not authenticated!"
        })
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.json({
            success:false,
            message: "Not found!"
        })
    }
    try {
        const decodeUser = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
        req.user = decodeUser;
        next();
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message : "Invalid Token"
        })
    }
}

module.exports = authGuard;