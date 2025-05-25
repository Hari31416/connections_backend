const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    console.log(
      `[AUTH] [WARN] No token provided for ${req.method} ${
        req.path
      } - IP: ${req.ip.replace(/:/g, "***")}`
    );
    return res.status(401).json({ error: "No token" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
    if (err) {
      console.log(
        `[AUTH] [WARN] Invalid token for ${req.method} ${
          req.path
        } - IP: ${req.ip.replace(/:/g, "***")}`
      );
      return res.status(403).json({ error: "Invalid token" });
    }

    console.log(
      `[AUTH] Authenticated user (ID: ${user.userId}) for ${req.method} ${req.path}`
    );
    req.user = user;
    next();
  });
};

module.exports = auth;
