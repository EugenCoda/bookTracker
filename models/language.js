var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var LanguageSchema = new Schema(
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

// Virtual for language's URL
LanguageSchema.virtual("url").get(function () {
  return "/catalog/language/" + this._id;
});

//Export model
module.exports = mongoose.model("Language", LanguageSchema);
