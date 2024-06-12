const { Schema, Mongoose, default: mongoose } = require("mongoose");
const { productSchmema } = require("./product");

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    products: [
      {
        product: productSchmema,
        quantity: Number,
      },
    ],
  },
  { timestamps: true }
);

const Order = mongoose.model("orders", orderSchema);
exports.Order = Order;
