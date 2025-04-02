import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

class MongoSingleton {
  static #instance;

  constructor() {
    if (MongoSingleton.#instance) {
      throw new Error("❌ Ya existe una Instancia de MongoSingleton...");
    }
    this.#connect();
    MongoSingleton.#instance = this;
  }

  async #connect() {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("🔗 Esa! ;) Ya estás Conectado a tu Base de MongoDB!");
    } catch (error) {
      console.error(
        "❌ Hubo un Error al querer Conectar con MongoDB...:",
        error
      );
      process.exit(1);
    }
  }

  static getInstance() {
    if (!MongoSingleton.#instance) {
      MongoSingleton.#instance = new MongoSingleton();
    }
    return MongoSingleton.#instance;
  }
}

export default MongoSingleton;
