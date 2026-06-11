const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // console.log("🛡️ Auth Middleware Invoked.");
  // console.log("token:", req.header('Authorization')); // Debug log for token presence
  // console.log(`Request Path: ${req.path}, Method: ${req.method}`);
  const authHeader = req.header('Authorization');

  // Expecting: "Bearer TOKEN"
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    console.log("🛡️ Auth: No token found in header");
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // ✅ MUST match the same secret used during login
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = verified;

    next();
  } catch (err) {
    console.error("🛡️ Auth Verification Failed:", err.message);

    // More specific error handling
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    res.status(403).json({ 
      error: "Invalid token",
      details: err.message 
    });
  }
};