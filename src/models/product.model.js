import { Schema, model } from "mongoose";
import paginate from "mongoose-paginate-v2";

const productSchema = new Schema(
  {
    title: {
      index: { name: "idx_title" },
      type: String,
      required: [true, "❌ El Título es obligatorio..."],
      uppercase: true,
      trim: true,
      minLength: [3, "❌ Debe tener al menos 3 Carácteres..."],
      maxLength: [25, "❌ Debe tener como máximo 25 Carácteres..."],
    },
    description: {
      type: String,
      required: [true, "❌ La Descripción es obligatoria..."],
    },
    code: {
      type: String,
      required: [true, "❌ El Código es obligatorio..."],
      unique: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, "❌ El Precio es obligatorio..."],
      min: [0, "❌ El Precio tiene que ser un Número Positivo..."],
    },
    status: {
      type: Boolean,
      required: [true, "❌ El Estado es obligatorio..."],
    },
    stock: {
      type: Number,
      required: [true, "❌ El Stock es obligatorio..."],
      min: [0, "❌ El Stock tiene que ser un Número Positivo..."],
    },
    category: {
      type: String,
      required: [true, "❌ La Categoría es obligatoria..."],
    },
    thumbnails: {
      type: [String],
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productSchema.index({ title: 1 });

productSchema.plugin(paginate);

const ProductModel = model("products", productSchema);

export default ProductModel;
