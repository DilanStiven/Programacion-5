import { HttpError } from "../utils/http-error.js";

export function validateTareaId(id) {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId < 1) {
    throw new HttpError(400, "INVALID_ID", "El identificador de tarea no es válido.");
  }

  return parsedId;
}
