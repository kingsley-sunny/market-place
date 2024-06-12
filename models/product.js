const { Schema, model } = require("mongoose");
const { User } = require("./user");

const productSchmema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
  },
  { timestamps: true, strict: true }
);

// productSchmema.pre("deleteOne", { document: false, query: true }, async function (erro) {
//   const product = await this.model.findOne(this.getFilter());
//   User.updateMany(
//     { "cart.items.productId": product._id },
//     { $pull: { "cart.items": { productId: product._id, quantity: { $gte: 0 } } } }
//   );
//   console.log("nack");
// });

exports.Product = model("product", productSchmema);
exports.productSchmema = productSchmema;
