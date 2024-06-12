const path = require("path");

const express = require("express");

const adminController = require("../controllers/admin");
const { isAuth } = require("../middlewares/is-auth");
const { body } = require("express-validator");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// // /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// // /admin/add-product => POST
router.post(
  "/add-product",
  isAuth,
  [
    body("title", "Title must be minium 3 characters").isString().isLength({ min: 3 }),
    body("price", "price must be a number").isNumeric(),
    body("description", "").isLength({ min: 5, max: 400 }),
  ],
  adminController.postAddProduct
);

// // // /admin/edit-product => GET
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

// // // /admin/edit-product => POST
router.post(
  "/edit-product",
  [
    body("title", "Title must be minium 3 characters").isString().isLength({ min: 3 }),
    body("price", "price must be a number").isNumeric(),
    body(
      "description",
      "Description must be minium 3 characters and maximum 5 characters"
    ).isLength({ min: 5, max: 400 }),
  ],
  isAuth,
  adminController.postEditProduct
);

// // // /admin/delete-product => POST
router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
