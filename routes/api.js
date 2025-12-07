"use strict";

const mongoose = require("mongoose");

// Modelo
const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: { type: [String], default: [] }
});

const Book = mongoose.model("Book", BookSchema);

module.exports = function (app) {
  // =========================
  //  GET /api/books
  // =========================
  app.route("/api/books")
    .get(async function (req, res) {
      const books = await Book.find();

      const formatted = books.map(b => ({
        _id: b._id,
        title: b.title,
        commentcount: b.comments.length
      }));

      res.json(formatted);
    })

    // =========================
    // POST /api/books
    // =========================
    .post(async function (req, res) {
      const { title } = req.body;

      if (!title) {
        return res.send("missing required field title");
      }

      try {
        const newBook = await Book.create({ title });
        res.json({ _id: newBook._id, title: newBook.title });
      } catch (e) {
        res.send("error creating book");
      }
    })

    // =========================
    // DELETE /api/books
    // =========================
    .delete(async function (req, res) {
      await Book.deleteMany({});
      res.send("complete delete successful");
    });

  // ==========================================
  //  RUTAS CON ID: /api/books/:id
  // ==========================================
  app.route("/api/books/:id")
    .get(async function (req, res) {
      const id = req.params.id;

      try {
        const book = await Book.findById(id);
        if (!book) return res.send("no book exists");

        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });

      } catch {
        res.send("no book exists");
      }
    })

    // POST COMMENT
    .post(async function (req, res) {
      const id = req.params.id;
      const { comment } = req.body;

      if (!comment) return res.send("missing required field comment");

      try {
        const book = await Book.findById(id);
        if (!book) return res.send("no book exists");

        book.comments.push(comment);
        await book.save();

        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });

      } catch {
        res.send("no book exists");
      }
    })

    // DELETE BY ID
    .delete(async function (req, res) {
      const id = req.params.id;

      try {
        const deleted = await Book.findByIdAndDelete(id);
        if (!deleted) return res.send("no book exists");

        res.send("delete successful");

      } catch {
        res.send("no book exists");
      }
    });
};
