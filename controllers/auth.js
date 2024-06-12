const { User } = require("../models/user");
const bycript = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

var transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  secure: false,
  auth: {
    user: "4b79854a7b0376",
    pass: "bcacc6eebe86d8",
  },
});

exports.getLoginPage = (req, res, next) => {
  const flashMessages = req.flash("error");
  let message;
  if (flashMessages.length !== 0) {
    message = flashMessages;
    console.log(message);
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: { email: "", password: "" },
    validationErrors: [],
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password },
      validationErrors: errors.array(),
    });
  }

  try {
    const user = await User.findOne({ email: email });
    if (user) {
      const doPasswordMatch = await bycript.compare(password, user.password);
      if (!doPasswordMatch) {
        req.flash("error", "Password is incorrect");
        return res.redirect("/login");
      }

      req.session.user = user;
      req.session.isLoggedIn = true;
      await req.session.save();
      return res.redirect("/products");
    }

    req.flash("error", "Email Does not exists");
    res.redirect("/login");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};

exports.getSignUpPage = (req, res, next) => {
  const flashMessages = req.flash("error");
  let message;
  if (flashMessages.length !== 0) {
    message = flashMessages;
    console.log(message);
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "SignUp",
    errorMessage: message,
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationErrors: [],
  });
};

exports.postSignUp = async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  // VALIDATE ALL THE INPUT
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "SignUp",
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password, confirmPassword },
      validationErrors: errors.array(),
    });
  }

  try {
    const hashedPassword = await bycript.hash(password, 12);
    const newUser = new User({
      email,
      name: "Sunny",
      password: hashedPassword,
      cart: { items: [] },
    });
    await newUser.save();

    transporter.sendMail({
      from: `"sandbox.smtp.mailtrap.io 👻" < sandbox.smtp.mailtrap.io>`, // sender address
      to: email, // list of receivers
      subject: "Hello Dear ✔", // Subject line
      text: "Thanks for registering ?", // plain text body
      html: `
        <div>
          <p>From Node Shopping</p>
          <h2>Thank you for your registration, We hope to serve you the best</h2>        
        </div>
      `, // html body
    });

    return res.redirect("/login");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};

exports.postLogout = async (req, res, next) => {
  try {
    await req.session.destroy();
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
  res.redirect("/login");
};

exports.getResetPage = async (req, res, next) => {
  const flashMessages = req.flash("error");
  let message;
  if (flashMessages.length !== 0) {
    message = flashMessages;
    console.log(message);
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = async (req, res, next) => {
  crypto.randomBytes(32, async (err, buffer) => {
    try {
      if (err) {
        req.flash("error", "something went wrong");
        return res.redirect("/reset");
      }
      const token = buffer.toString("hex");
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        req.flash("error", "No Account with that email found!");
        return res.redirect("/reset");
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      await user.save();

      // send the reset passwod link to the email
      transporter.sendMail({
        from: `"sandbox.smtp.mailtrap.io 👻" < sandbox.smtp.mailtrap.io>`, // sender address
        to: req.body.email, // list of receivers
        subject: "Hello Dear ✔", // Subject line
        text: "Thanks for registering ?", // plain text body
        html: `
          <div>
            <h3>You Requested from a password reset</h3>
            <p>click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password </p>        
          </div>
        `, // html body
      });
      req.flash("error", "A password reset link have been sent to your email");
      res.redirect("/reset");
    } catch (error) {
      const err = new Error(error);
      err.httpStatusCode = 500;
      next(err);
    }
  });
};

exports.getNewPasswordPage = async (req, res, next) => {
  const token = req.params.token;
  const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });

  if (!user) {
    return res.redirect("/404");
  }

  const flashMessages = req.flash("error");
  let message;
  if (flashMessages.length !== 0) {
    message = flashMessages;
    console.log(message);
  }
  res.render("auth/new-password", {
    path: "/new-password",
    pageTitle: "New Password",
    errorMessage: message,
    userId: user._id,
    token: token,
  });
};

exports.postNewPassword = async (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.token;

  try {
    const user = await User.findOne({
      _id: userId,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "User not Found");
      return res.redirect(req.url);
    }

    const hashedPassword = await bycript.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.redirect("/login");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};
