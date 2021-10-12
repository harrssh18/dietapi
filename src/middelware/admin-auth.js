const jwt = require("jsonwebtoken");

const AdminverifyToken = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.redirect("error");
  }
  try {
    const decoded = jwt.verify(token, "thisisahealthydietwebsite");
    req.user = decoded;
  } catch (err) {
    return res.redirect("error");
  }
  return next();
};

module.exports = AdminverifyToken;

