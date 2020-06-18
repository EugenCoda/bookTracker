var mongoose = require("mongoose");
var moment = require("moment");

var Schema = mongoose.Schema;

var BooklistSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  personal_list: [
    {
      book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
      date_added: { type: Date },
      date_started: { type: Date },
      date_finished: { type: Date },

      status: {
        type: String,
        required: true,
        enum: ["Not read", "In progress", "Read"],
        default: "Not read",
      },

      availability: {
        type: String,
        required: true,
        enum: ["No", "Mail", "Hard copy", "Soft copy", "Github", "Web"],
        default: "No",
      },
    },
  ],
});

// Virtual for booklist's URL
BooklistSchema.virtual("url").get(function () {
  return "/users/mylist/" + this._id;
});

BooklistSchema.virtual("date_added_formatted").get(function () {
  return this.personal_list.date_added
    ? moment(this.personal_list.date_added).format("YYYY-MM-DD")
    : "";
});

BooklistSchema.virtual("date_started_formatted").get(function () {
  return this.personal_list.date_started
    ? moment(this.personal_list.date_started).format("YYYY-MM-DD")
    : "";
});

BooklistSchema.virtual("date_finished_formatted").get(function () {
  return this.personal_list.date_finished
    ? moment(this.personal_list.date_finished).format("YYYY-MM-DD")
    : "";
});

//Export model
module.exports = mongoose.model("Booklist", BooklistSchema);
