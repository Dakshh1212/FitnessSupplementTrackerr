const jwt = require("jsonwebtoken");
const db = require("../config/mysql");

/* =======================
   ✅ PROTECT MIDDLEWARE
======================= */
const protect = (req, res, next) => {

  let token;

  // ✅ CHECK TOKEN
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {

    token =
      req.headers.authorization.split(" ")[1];

  }

  // ❌ NO TOKEN
  if (!token) {

    return res.status(401).json({
      success: false,
      message: "No token ❌"
    });

  }

  try {

    // ✅ VERIFY TOKEN
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ✅ GET USER FROM MYSQL
    db.query(
      "SELECT * FROM users WHERE id = ?",
      [decoded.id],
      (err, results) => {

        if (err || results.length === 0) {

          return res.status(401).json({
            success: false,
            message: "User not found ❌"
          });

        }

        // ✅ SAVE USER
        req.user = results[0];

        next();

      }
    );

  } catch (err) {

    console.log(err);

    return res.status(401).json({
      success: false,
      message: "Token failed ❌"
    });

  }

};

module.exports = {
  protect
};