const express = require("express");
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  lockContact,
  unlockContact,
} = require("../controllers/contactController");
const { auth } = require("../middleware/auth");
const {
  contactValidation,
  contactQueryValidation,
  idValidation,
} = require("../middleware/validation");

const router = express.Router();

router.use(auth);

router.get("/", contactQueryValidation, getContacts);

router.post("/", contactValidation, createContact);

router.get("/:id", idValidation, getContact);

router.put("/:id", idValidation, contactValidation, updateContact);

router.delete("/:id", idValidation, deleteContact);

router.post("/:id/lock", idValidation, lockContact);

router.post("/:id/unlock", idValidation, unlockContact);

module.exports = router;
