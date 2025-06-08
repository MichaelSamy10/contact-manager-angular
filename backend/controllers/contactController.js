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

const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    await Contact.findByIdAndDelete(req.params.id);

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

module.exports = {
  getContacts,
  getContact,
  createContact,
  deleteContact,
};
