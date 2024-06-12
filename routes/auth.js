const express = require("express");
const {
  getLoginPage,
  postLogin,
  getSignUpPage,
  postSignUp,
  postLogout,
  getResetPage,
  postReset,
  getNewPasswordPage,
  postNewPassword,
} = require("../controllers/auth");
const { body, check } = require("express-validator");
const { User } = require("../models/user");

const router = express.Router();

router.get("/login", getLoginPage);

router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Please Enter a valid Email"),
    body("password", "Please your password must be minimum 5 characters long").isLength({ min: 5 }),
  ],
  postLogin
);

router.get("/signup", getSignUpPage);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please Enter a valid Email")
      .custom(async value => {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject("E-mail already in use!!");
        }
        return true;
      }),
    body("password", "Please your password must be minimum 5 characters long")
      .trim()
      .isLength({ min: 5 }),
    body("confirmPassword")
      .trim()
      .custom((value, req) => {
        console.log(value);
        if (value !== req.req.body.password) {
          throw new Error("Password does not match");
        }
        return true;
      }),
  ],
  postSignUp
);

router.post("/logout", postLogout);

router.get("/reset", getResetPage);

router.post("/reset", postReset);

router.get("/reset/:token", getNewPasswordPage);

router.post("/new-password", postNewPassword);

exports.authRoutes = router;
