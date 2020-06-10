var mongoose = require("mongoose");
var moment = require("moment");

var Schema = mongoose.Schema;

var BookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "Author", required: true },
  summary: { type: String, required: true },
  date_of_read: { type: Date },
  isbn: { type: String, required: true },
  genre: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
  status: {
    type: String,
    required: true,
    enum: ["No", "Yahoo", "Hardcopy", "Softcopy", "Github", "Web"],
    default: "No",
  },
});

// Virtual for book's URL
BookSchema.virtual("url").get(function () {
  return "/catalog/book/" + this._id;
});

BookSchema.virtual("date_of_read_formatted").get(function () {
  return this.date_of_read
    ? moment(this.date_of_read).format("YYYY-MM-DD")
    : "";
});

//Export model
module.exports = mongoose.model("Book", BookSchema);
