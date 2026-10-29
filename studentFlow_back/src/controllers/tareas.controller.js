import * as tareasService from "../services/tareas.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { validateTareaId } from "../validators/tareas.validator.js";

export async function listSubtareasByTarea(request, response, next) {
  try {
    const tareaId = validateTareaId(request.params.id);
    const subtareas = await tareasService.listSubtareasByTareaId(tareaId, request.user.id);
    return sendSuccess(response, subtareas);
  } catch (error) {
    return next(error);
  }
}
