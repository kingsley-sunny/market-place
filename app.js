const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");

const adminRoute = require("./routes/admin");
const errorController = require("./controllers/error");
const { connectToMongodb, connectionString } = require("./database/database");
const { shopRoute } = require("./routes/shop");
const { User } = require("./models/user");
const { Product } = require("./models/product");
const { authRoutes } = require("./routes/auth");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const csurf = require("csurf");
const flash = require("connect-flash");

const app = express();
const store = new MongoDbStore({
  uri: connectionString,
  collection: "sessions",
  connectionOptions: { ssl: true },
});
store.on("error", function (error) {
  console.log(error);
});

const csrf = csurf();
const fileStorage = multer.diskStorage({
  destination: "images",
  filename(req, file, cb) {
    cb(null, `${Date.now().toString()}-${file.originalname}`);
  },
});

const fileFilter = (res, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// we set it to ejs because express has registed the ejs and pug template by default
app.set("view engine", "ejs");
app.set("views", "views");

app.use(multer({ fileFilter, storage: fileStorage }).single("image"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(session({ secret: "Sunny", resave: false, saveUninitialized: false, store: store }));
app.use(csrf);

app.use(async (req, res, next) => {
  const formalUser = req.session.user;
  try {
    if (formalUser) {
      const user = await User.findById(formalUser._id);
      if (!user) {
        return next();
      }
      req.user = user;
    }
    next();
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
});

app.use((req, res, next) => {
  try {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
});

app.use(flash());

app.use("/admin", adminRoute);
app.use(shopRoute);
app.use(authRoutes);

app.use("/500", errorController.get500);

// The 404 page
app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(error.httpStatusCode).render("500", {
    pageTitle: "Error",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: req.csrfToken(),
  });
  next();
});

(async () => {
  try {
    await connectToMongodb();
    console.log("started !!!!!! ", 3000);
    app.listen(3000);
  } catch (error) {}
})();

// process.kill();

// process.on("uncaughtException", () => {
//   console.log("nakc");
//   process.on("SIGTERM", e => {
//     console.log("hello");
//   });
// });
