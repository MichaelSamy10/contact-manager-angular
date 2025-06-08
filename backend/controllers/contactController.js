const Contact = require("../models/Contact");
const mongoose = require("mongoose");

const getContacts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } },
        ],
      };
    }

    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const Contacts = await Contact.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("createdBy", "username")
      .populate("lockedBy", "username");

    const total = await Contact.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        Contacts,
        pagination: {
          current: page,
          pages: totalPages,
          total,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching contacts",
    });
  }
};

const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("lockedBy", "username");
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      data: { contact },
    });
  } catch (error) {
    console.error("Get contact error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching contact",
    });
  }
};

const createContact = async (req, res) => {
  try {
    const { name, phone, address, notes } = req.body;

    const existingContact = await Contact.findOne({ phone });
    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: "Contact with the same phone number already exists",
      });
    }

    const contact = await Contact.create({
      name,
      phone,
      address,
      notes: notes || "",
      createdBy: req.user.id,
    });
    const populatedContact = await Contact.findById(contact._id)
      .populate("createdBy", "username")
      .populate("lockedBy", "username");

    res.status(201).json({
      success: true,
      message: "Contact created successfully",
      data: { contact: populatedContact },
    });
  } catch (error) {
    console.error("Create contact error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating contact",
    });
  }
};

const updateContact = async (req, res) => {
  try {
    const { name, phone, address, notes } = req.body;
    const contactId = req.params.id;

    let contact = await Contact.findById(contactId);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    if (phone !== contact.phone) {
      const existingContact = await Contact.findOne({
        phone,
        _id: { $ne: contactId },
      });
      if (existingContact) {
        return res.status(400).json({
          success: false,
          message: "Contact with this phone number already exists",
        });
      }

      contact = await Contact.findByIdAndUpdate(
        contactId,
        {
          name,
          phone,
          address,
          notes: notes || "",
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("createdBy", "username")
        .populate("lockedBy", "username");

      // Emit real-time update
      // req.io.emit("contact-updated", contact);

      res.json({
        success: true,
        message: "Contact updated successfully",
        data: { contact },
      });
    }
  } catch (error) {
    console.error("Update contact error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating contact",
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }
    // Check if contact is locked by another user
    if (contact.isLocked && contact.lockedBy.toString() !== req.user.id) {
      return res.status(423).json({
        success: false,
        message: "Contact is currently being edited by another user",
      });
    }

    await Contact.findByIdAndDelete(req.params.id);

    // Emit real-time update
    // req.io.emit("contact-deleted", { contactId: req.params.id });

    res.json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting contact",
    });
  }
};

const lockContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    if (contact.isLocked && contact.lockedBy.toString() !== req.user.id) {
      const lockedByUser = await Contact.findById(req.params.id).populate(
        "lockedBy",
        "username"
      );

      return res.status(423).json({
        success: false,
        message: `Contact is already being edited by ${lockedByUser.lockedBy.username}`,
      });
    }

    // Lock the contact
    contact.isLocked = true;
    contact.lockedBy = req.user.id;
    contact.lockedAt = new Date();
    await contact.save();

    // Emit real-time update
    req.io.emit("contact-locked", {
      contactId: req.params.id,
      lockedBy: req.user.id,
      username: req.user.username,
    });

    res.json({
      success: true,
      message: "Contact locked successfully",
      data: { contactId: req.params.id },
    });
  } catch (error) {
    console.error("Lock contact error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while locking contact",
    });
  }
};

const unlockContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // Only the user who locked it can unlock it
    if (contact.isLocked && contact.lockedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only unlock contacts you have locked",
      });
    }

    // Unlock the contact
    contact.isLocked = false;
    contact.lockedBy = null;
    contact.lockedAt = null;
    await contact.save();

    // Emit real-time update
    req.io.emit("contact-unlocked", { contactId: req.params.id });

    res.json({
      success: true,
      message: "Contact unlocked successfully",
      data: { contactId: req.params.id },
    });
  } catch (error) {
    console.error("Unlock contact error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while unlocking contact",
    });
  }
};

module.exports = {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  lockContact,
  unlockContact,
};
