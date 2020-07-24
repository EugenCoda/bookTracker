var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ReviewSchema = new Schema(
  {
    review: String,
    rating: Number,
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

//Export model
module.exports = mongoose.model("Review", ReviewSchema);
