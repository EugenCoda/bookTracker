var mongoose = require("mongoose");
var moment = require("moment");

var Schema = mongoose.Schema;

var AuthorSchema = new Schema(
  {
    first_name: { type: String, required: true, max: 100 },
    family_name: { type: String, required: true, max: 100 },
    country: { type: Schema.Types.ObjectId, ref: "Country", required: true },
    date_of_birth: { type: Date },
    date_of_death: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Virtual for author's full name
AuthorSchema.virtual("name").get(function () {
  // To avoid errors in cases where an author does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case

  var fullname = "";
  if (this.first_name && this.family_name) {
    fullname = this.family_name + ", " + this.first_name;
  }
  if (!this.first_name || !this.family_name) {
    fullname = "";
  }

  return fullname;
});

AuthorSchema.virtual("date_of_birth_formatted").get(function () {
  return this.date_of_birth ? moment(this.date_of_birth).format("YYYY") : "";
});

AuthorSchema.virtual("date_of_death_formatted").get(function () {
  return this.date_of_death ? moment(this.date_of_death).format("YYYY") : "";
});

// Virtual for author's lifespan
AuthorSchema.virtual("lifespan").get(function () {
  return (
    this.date_of_birth_formatted +
    " - " +
    this.date_of_death_formatted
  ).toString();
});

// Virtual for author's URL
AuthorSchema.virtual("url").get(function () {
  return "/catalog/author/" + this._id;
});

//Virtual for date format in the edit mode
AuthorSchema.virtual("date_of_birth_yyyy_mm_dd").get(function () {
  return moment(this.date_of_birth).format("YYYY-MM-DD");
});

AuthorSchema.virtual("date_of_death_yyyy_mm_dd").get(function () {
  return moment(this.date_of_death).format("YYYY-MM-DD");
});

//Export model
module.exports = mongoose.model("Author", AuthorSchema);
