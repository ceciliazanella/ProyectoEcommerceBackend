import { Schema, model } from "mongoose";

const cartSchema = new Schema(
  {
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "products",
          required: [true, "El Producto es obligatorio..."],
        },
        quantity: {
          type: Number,
          required: [true, "La Cantidad es obligatoria..."],
          min: [1, "La Cantidad es 1 por defecto y debe ser mayor que 0..."],
        },
        total: {
          type: Number,
          default: 0,
        },
        _id: false,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const CartModel = model("Cart", cartSchema);

export default CartModel;
