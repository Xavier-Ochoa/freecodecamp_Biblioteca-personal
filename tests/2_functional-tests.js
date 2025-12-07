const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

let testId;

suite("Functional Tests", function () {

  suite("POST /api/books", function () {
    test("POST with title", function (done) {
      chai
        .request(server)
        .post("/api/books")
        .send({ title: "Test Book" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, "title");
          assert.property(res.body, "_id");
          testId = res.body._id;
          done();
        });
    });

    test("POST with no title", function (done) {
      chai
        .request(server)
        .post("/api/books")
        .send({})
        .end(function (err, res) {
          assert.equal(res.text, "missing required field title");
          done();
        });
    });
  });

  suite("GET /api/books", function () {
    test("GET list of books", function (done) {
      chai
        .request(server)
        .get("/api/books")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          if (res.body.length > 0) {
            assert.property(res.body[0], "commentcount");
            assert.property(res.body[0], "title");
            assert.property(res.body[0], "_id");
          }
          done();
        });
    });
  });

  suite("GET /api/books/:id", function () {
    test("GET with id not in DB", function (done) {
      chai
        .request(server)
        .get("/api/books/123456789012")
        .end(function (err, res) {
          assert.equal(res.text, "no book exists");
          done();
        });
    });

    test("GET with valid id", function (done) {
      chai
        .request(server)
        .get("/api/books/" + testId)
        .end(function (err, res) {
          assert.property(res.body, "_id");
          assert.property(res.body, "title");
          assert.property(res.body, "comments");
          done();
        });
    });
  });

  suite("POST /api/books/:id", function () {
    test("POST comment", function (done) {
      chai
        .request(server)
        .post("/api/books/" + testId)
        .send({ comment: "First comment!" })
        .end(function (err, res) {
          assert.property(res.body, "comments");
          assert.include(res.body.comments, "First comment!");
          done();
        });
    });

    test("POST no comment", function (done) {
      chai
        .request(server)
        .post("/api/books/" + testId)
        .send({})
        .end(function (err, res) {
          assert.equal(res.text, "missing required field comment");
          done();
        });
    });

    test("POST id not in DB", function (done) {
      chai
        .request(server)
        .post("/api/books/123456789012")
        .send({ comment: "test" })
        .end(function (err, res) {
          assert.equal(res.text, "no book exists");
          done();
        });
    });
  });

  suite("DELETE /api/books/:id", function () {
    test("DELETE valid id", function (done) {
      chai
        .request(server)
        .delete("/api/books/" + testId)
        .end(function (err, res) {
          assert.equal(res.text, "delete successful");
          done();
        });
    });

    test("DELETE id not in DB", function (done) {
      chai
        .request(server)
        .delete("/api/books/123456789012")
        .end(function (err, res) {
          assert.equal(res.text, "no book exists");
          done();
        });
    });
  });

  suite("DELETE /api/books", function () {
    test("Delete all books", function (done) {
      chai
        .request(server)
        .delete("/api/books")
        .end(function (err, res) {
          assert.equal(res.text, "complete delete successful");
          done();
        });
    });
  });
});
