const { ObjectId } = require("mongodb");
const { Product } = require("../models/product");
const { User } = require("../models/user");
const { default: mongoose } = require("mongoose");
const { validationResult } = require("express-validator");
const { deleteFile } = require("../util/util");
const path = require("path");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);
  console.log(image);

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: "Attached file should be an imge",
      validationErrors: [],
    });
  }

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  try {
    await new Product({
      title,
      imageUrl: image.path,
      price,
      description,
      userId: req.user._id,
    }).save();
    return res.redirect("/");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};

exports.getEditProduct = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    const product = await Product.findById(productId);
    if (product) {
      return res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/Edit-product",
        editing: true,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
      });
    }
    return res.redirect("/");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const product = req.body;
  const id = product.productId;
  const title = product.title;
  const image = req.file;
  const description = product.description;
  const price = product.price;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title,
        price,
        description,
        _id: id,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  try {
    const product = await Product.findOne({ _id: id });
    let oldImgUrl = product.imageUrl;
    product.title = title;
    product.description = description;
    product.price = price;
    if (image) {
      product.imageUrl = image.path;
    }
    await product.save();
    if (oldImgUrl !== product.imageUrl) {
      deleteFile(path.join(oldImgUrl));
    }
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error);
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const productId = req.body.productId;
  try {
    await User.updateMany(
      {},
      {
        $pull: {
          "cart.items": {
            productId: new mongoose.Types.ObjectId(productId),
          },
        },
      }
    );
    const product = await Product.findOne({ _id: productId, userId: req.user._id });
    let oldImgUrl = product.imageUrl;
    await product.deleteOne();
    deleteFile(path.join(oldImgUrl));
    return res.redirect("/admin/products");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.user._id });
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};
