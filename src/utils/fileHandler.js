import fs from "fs";
import path from "path";

const validateFilePathAndName = (filepath, filename) => {
  if (!filepath)
    throw new Error(`No se puede registrar la ruta del archivo ${filename}.`);
  if (!filename)
    throw new Error(`No se puede registrar el nombre del archivo ${filename}.`);
};

export const readJsonFile = async (filepath, filename) => {
  validateFilePathAndName(filepath, filename);

  try {
    const content = await fs.promises.readFile(
      path.join(filepath, filename),
      "utf8"
    );
    return JSON.parse(content || "[]");
  } catch (error) {
    throw new Error(`Error al leer el archivo ${filename}.`);
  }
};

export const writeJsonFile = async (filepath, filename, content) => {
  validateFilePathAndName(filepath, filename);

  if (!content) throw new Error("No se registra contenido.");

  try {
    await fs.promises.writeFile(
      path.join(filepath, filename),
      JSON.stringify(content, null, "\t"),
      "utf8"
    );
  } catch (error) {
    throw new Error(`Error al escribir en el archivo ${filename}.`);
  }
};

export const deleteFile = async (filepath, filename) => {
  validateFilePathAndName(filepath, filename);

  try {
    await fs.promises.unlink(path.join(filepath, filename));
  } catch (error) {
    if (error.code === "ENOENT") {
      console.warn(`El archivo ${filename} no existe.`);
    } else {
      throw new Error(`Error al eliminar el archivo ${filename}.`);
    }
  }
};
