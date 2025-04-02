import { Schema, model } from "mongoose";

const cartSchema = new Schema(
  {
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "products",
          required: [true, "❌ El Producto es obligatorio..."],
        },
        quantity: {
          type: Number,
          required: [true, "❌ La Cantidad es obligatoria..."],
          min: [1, "❌ La Cantidad tiene que ser mayor que 0..."],
        },
        _id: false,
      },
    ],
    total: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

cartSchema.pre("save", async function (next) {
  try {
    await this.populate("products.product");
    for (let item of this.products) {
      const product = item.product;

      if (product.stock < item.quantity) {
        return next(
          new Error(
            `❌ No hay suficiente Stock para el Producto: ${product.title}`
          )
        );
      }

      if (typeof product.price !== "number" || product.price <= 0) {
        return next(
          new Error(
            `❌ El Producto ${product.title} no tiene un Precio válido...`
          )
        );
      }
    }
    this.total = this.products.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);

    next();
  } catch (error) {
    next(error);
  }
});

const CartModel = model("Cart", cartSchema);

export default CartModel;
