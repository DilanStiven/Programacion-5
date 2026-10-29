import * as tareasRepository from "../repositories/tareas.repositorio.js";
import { HttpError } from "../utils/http-error.js";

export async function listSubtareasByTareaId(tareaId, userId) {
  const subtareas = await tareasRepository.findSubtareasByTareaIdAndUserId(tareaId, userId);

  if (subtareas === null) {
    throw new HttpError(
      404,
      "Tarea_not_found",
      "No se encontró la tarea con el ID proporcionado para el usuario especificado."
    );
  }

  return subtareas;
}
