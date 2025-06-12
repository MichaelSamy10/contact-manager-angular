const express = require("express");
const {
  getContacts,
  // getContact,
  createContact,
  deleteContact,
  updateContact,
} = require("../controllers/contactController");
const { auth } = require("../middleware/auth");
const {
  contactValidation,
  contactQueryValidation,
  idValidation,
} = require("../middleware/validation");

const router = express.Router();

// apply middleware to all routes
router.use(auth);

router.get("/", contactQueryValidation, getContacts);

router.post("/", contactValidation, createContact);

// router.get("/:id", idValidation, getContact);

router.delete("/:id", idValidation, deleteContact);

router.put("/:id", idValidation, updateContact);

module.exports = router;
