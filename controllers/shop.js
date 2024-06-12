const path = require("path");
const { Order } = require("../models/orders");
const { Product } = require("../models/product");
const { User } = require("../models/user");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const ITEMS_PER_PAGE = 5;

exports.getProducts = async (req, res, next) => {
  const page = +req.query.page || 1;
  try {
    let totalItems = await Product.count();
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    return res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (error) {
    console.log(error);
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.redirect("/404");
    }
    return res.render("shop/product-detail", {
      pageTitle: product.title,
      product,
      path: "/products",
    });
  } catch (error) {
    console.log(error);
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};

exports.getIndex = async (req, res, next) => {
  const page = +req.query.page || 1;
  try {
    let totalItems = await Product.count();
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    return res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (error) {
    console.log(error);
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const products = await req.user.getCart();
    console.log(products);
    return res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products,
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};

exports.postCart = async (req, res, next) => {
  const productId = req.body.productId;
  try {
    await req.user.addToCart(productId);
    return res.redirect("/cart");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};

exports.deleteCart = async (req, res, next) => {
  const productId = req.body.productId;
  try {
    await req.user.deleteProductFromCart(productId);
    return res.redirect("/cart");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ userId: userId });

    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: orders,
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};

exports.createOrder = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items.map(item => {
      const product = item.productId._doc;
      return { product: { ...product }, quantity: item.quantity };
    });
    const order = new Order({ userId: userId, products });
    order.save();

    req.user.cart.items = [];
    await req.user.save();

    return res.redirect("/orders");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};

exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.invoiceId;
  const fileName = `invoice-${orderId}.pdf`;
  try {
    const order = await Order.findOne({ _id: orderId, userId: req.user._id });
    if (order) {
      const doc = new PDFDocument({});
      doc.pipe(res);

      doc.fontSize(23).text("Invoice");
      doc.fontSize(12).text("--------------------------------------------------------");
      doc.text("");
      doc.text(" ");
      let totalPrice = 0;
      for (const product of order.products) {
        const { price, title } = product.product;
        totalPrice += price * product.quantity;
        doc.fontSize(16).text(`${title} - $${price}    x ${product.quantity}`);
      }
      doc.text(" ");
      doc.fontSize(18).text(`Total Price - $${totalPrice}`);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; ${fileName}.pdf`);

      return doc.end();
    }
    throw Error("Not found");
  } catch (error) {
    console.log(error.message);
    const err = new Error("Unauthorized");
    err.httpStatusCode = 404;
    next(err);
  }
};
