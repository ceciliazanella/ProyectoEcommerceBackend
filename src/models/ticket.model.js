import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const ticketSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },
    purchase_datetime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
    },
    purchaser: {
      type: String,
      required: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const TicketModel = model("Ticket", ticketSchema);

export default TicketModel;
