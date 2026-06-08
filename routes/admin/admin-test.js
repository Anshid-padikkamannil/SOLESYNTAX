const express = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("../../middlewares/auth");

router.get("/admin-test", isLoggedIn, isAdmin, (req, res) => {
      res.send("Admin Access Granted");
    }
);

module.exports = router;