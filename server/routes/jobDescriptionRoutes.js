const express = require("express");

const {
  createJobDescription,
  getJobDescriptions,
  getJobDescriptionById,
  publishJobDescription,
  closeJobDescription,
} = require("../controllers/jobDescriptionController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("RECRUITER"),
  createJobDescription
);

router.get(
  "/",
  protect,
  getJobDescriptions
);

router.get(
  "/:id",
  protect,
  getJobDescriptionById
);

router.patch(
  "/:id/publish",
  protect,
  authorizeRoles("RECRUITER"),
  publishJobDescription
);

router.patch(
  "/:id/close",
  protect,
  authorizeRoles("RECRUITER"),
  closeJobDescription
);

module.exports = router;