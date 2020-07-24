var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var BookSchema = new Schema(
  {
    title: { type: String, required: true },
    originalTitle: String,
    author: { type: Schema.Types.ObjectId, ref: "Author", required: true },
    author2: { type: Schema.Types.ObjectId, ref: "Author" },
    summary: { type: String, required: true },
    isbn: { type: String, required: true },
    genre: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
    language: {
      type: Schema.Types.ObjectId,
      ref: "Language",
      required: true,
    },
    originalLanguage: {
      type: Schema.Types.ObjectId,
      ref: "Language",
    },
    pages: Number,
    yearFirstPublished: Number,
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Virtual for book's URL
BookSchema.virtual("url").get(function () {
  return "/catalog/book/" + this._id;
});

// Virtual for book's booklist URL
BookSchema.virtual("booklisturl").get(function () {
  return "/booklists/" + this._id;
});

//Export model
module.exports = mongoose.model("Book", BookSchema);
