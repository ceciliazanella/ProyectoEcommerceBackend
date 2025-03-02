import { connect, Types } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  const URL = process.env.MONGO_URI;
  try {
    await connect(URL);
    console.log("Ya estás Conectado a MongoDB!");
  } catch (error) {
    console.error(
      "Mmm... Hubo un Error al querer Conectar con MongoDB...",
      error
    );
  }
};

export const isValidID = (id) => {
  return Types.ObjectId.isValid(id);
};
