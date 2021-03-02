const express = require("express");

const multer = require("multer");

const sharp = require("sharp");

const bodyParser = require("body-parser");

const path = require("path");

const fs = require("fs");

const imageSize = require("image-size");

require("dotenv").config();

const port = process.env.PORT || 8081;

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "image");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

app.set("view engine", "ejs");

app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "./", "public")));

app.use(
  multer({
    storage: fileStorage,
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/gif" ||
        file.mimetype === "image/svg+xml"
      ) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
  }).single("image")
);

app.get("/", (req, res, next) => {
  res.status(200).render("index.ejs");
});

app.post("/", (req, res, next) => {
  let format = req.body.format;
  let width = parseInt(req.body.width);
  let height = parseInt(req.body.height);
  let file = req.file;

  if (isNaN(width) || isNaN(height)) {
    let dimentions = imageSize(file.path);
    convertImg(dimentions.width, dimentions.height);
  } else {
    convertImg(width, height);
  }

  function convertImg(width, height) {
    let outputFilePath = Date.now() + "output." + format;
    sharp(file.path)
      .resize(width, height)
      .toFile(outputFilePath, (err, info) => {
        if (err) throw err;
        res.download(outputFilePath, (err) => {
          if (err) throw err;
          fs.unlinkSync(req.file.path);
          fs.unlinkSync(outputFilePath);
        });
      });
  }
});
app.listen(port, () => {
  console.log(`server is listening on port: http://localhost:${port}`);
});
