import * as recordatoriosRepository from "../repositories/recordatorios.repositorio.js";
import { HttpError } from "../utils/http-error.js";

export async function listRecordatorios(userId, filters) {
  const { recordatorios, total } = await recordatoriosRepository.findAllByUserId(userId, filters);

  return {
    data: recordatorios,
    meta: {
      page: filters.page,
      limit: filters.limit,
      total,
      pages: Math.ceil(total / filters.limit)
    }
  };
}

export async function getRecordatorioById(id, userId) {
  const recordatorio = await recordatoriosRepository.findByIdAndUserId(id, userId);

  if (!recordatorio) {
    throw new HttpError(404, "RECORDATORIO_NOT_FOUND", "No se encontró el recordatorio para el usuario indicado.");
  }

  return recordatorio;
}

export async function createRecordatorio(userId, recordatorio) {
  await ensureTaskBelongsToUser(recordatorio.idTarea, userId);
  const created = await recordatoriosRepository.createRecordatorio(userId, recordatorio);
  if (!created) {
    throw new HttpError(404, "TAREA_NOT_FOUND", "No se encontró la tarea para el usuario indicado.");
  }
  return created;
}

export async function replaceRecordatorio(id, userId, recordatorio) {
  await getRecordatorioById(id, userId);
  await ensureTaskBelongsToUser(recordatorio.idTarea, userId);
  return recordatoriosRepository.updateRecordatorio(id, userId, recordatorio);
}

export async function updateRecordatorio(id, userId, changes) {
  await getRecordatorioById(id, userId);
  if (changes.idTarea !== undefined) {
    await ensureTaskBelongsToUser(changes.idTarea, userId);
  }
  return recordatoriosRepository.updateRecordatorio(id, userId, changes);
}

export async function removeRecordatorio(id, userId) {
  await getRecordatorioById(id, userId);
  await recordatoriosRepository.deleteRecordatorio(id, userId);
}

async function ensureTaskBelongsToUser(taskId, userId) {
  const taskExists = await recordatoriosRepository.taskBelongsToUser(taskId, userId);

  if (!taskExists) {
    throw new HttpError(404, "TAREA_NOT_FOUND", "No se encontró la tarea para el usuario indicado.");
  }
}
