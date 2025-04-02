import fs from "fs";
import path from "path";

const validateFilePathAndName = (filepath, filename) => {
  if (!filepath)
    throw new Error(
      `❌ No se puede Registrar la Ruta del Archivo ${filename}.`
    );
  if (!filename)
    throw new Error(
      `❌ No se puede Rgistrar el Nombre del Archivo ${filename}.`
    );
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
    throw new Error(`❌ Error al querer Leer el Archivo ${filename}...`);
  }
};

export const writeJsonFile = async (filepath, filename, content) => {
  validateFilePathAndName(filepath, filename);
  if (!content) throw new Error("❌ No hay Contenido registrado...");
  try {
    await fs.promises.writeFile(
      path.join(filepath, filename),
      JSON.stringify(content, null, "\t"),
      "utf8"
    );
  } catch (error) {
    throw new Error(`❌ Error al querer Escribir en el Archivo ${filename}...`);
  }
};

export const deleteFile = async (filepath, filename) => {
  validateFilePathAndName(filepath, filename);
  try {
    await fs.promises.unlink(path.join(filepath, filename));
  } catch (error) {
    if (error.code === "ENOENT") {
      console.warn(`❌ El Archivo ${filename} no existe.`);
    } else {
      throw new Error(`❌Error al querer Eliminar el Archivo ${filename}...`);
    }
  }
};
