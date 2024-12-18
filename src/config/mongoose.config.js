import { connect, Types } from "mongoose";

export const connectDB = async () => {
  const URL =
    "mongodb+srv://corazon_de_chocolate:1455@cluster0.mulyi.mongodb.net/ecommerce";
  try {
    await connect(URL);
    console.log("Estás conectado a MongoDB!");
  } catch (error) {
    console.log("Hubo un error al conectar con MongoDB...", error.message);
  }
};

export const isValidID = (id) => {
  return Types.ObjectId.isValid(id);
};
