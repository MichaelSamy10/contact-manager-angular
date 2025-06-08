const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [5, "Address must be at least 5 characters"],
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// // Index for better search performance
// ContactSchema.index({ name: 'text', phone: 'text', address: 'text' });
// ContactSchema.index({ createdBy: 1 });
// ContactSchema.index({ isLocked: 1 });

// // Populate user information when retrieving contacts
// ContactSchema.pre(/^find/, function(next) {
//   this.populate({
//     path: 'createdBy',
//     select: 'username'
//   }).populate({
//     path: 'lockedBy',
//     select: 'username'
//   });
//   next();
// });

module.exports = mongoose.model("Contact", ContactSchema);
