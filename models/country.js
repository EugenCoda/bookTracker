var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CountrySchema = new Schema(
  {
    name: { type: String, required: true, min: 3, max: 100 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Virtual for country's URL
CountrySchema.virtual("url").get(function () {
  return "/catalog/country/" + this._id;
});

//Export model
module.exports = mongoose.model("Country", CountrySchema);
