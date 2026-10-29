import { request } from "./http.js";

function recordatorioPath(id) {
  const parsed = Number(id);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new TypeError("El ID debe ser un entero mayor que cero.");
  }
  return `/recordatorios/${parsed}`;
}

/** Filtros: search, leido, tareaId, canal, page, limit, sort y order. */
export function listarRecordatorios(filtros = {}) {
  return request("/recordatorios", { query: filtros });
}

export function obtenerRecordatorio(id) {
  return request(recordatorioPath(id));
}

/** idTarea y mensaje son obligatorios; fechaHora usa YYYY-MM-DDTHH:mm. */
export function crearRecordatorio(recordatorio) {
  return request("/recordatorios", { method: "POST", body: recordatorio });
}

export function reemplazarRecordatorio(id, recordatorio) {
  return request(recordatorioPath(id), { method: "PUT", body: recordatorio });
}

export function actualizarRecordatorio(id, cambios) {
  return request(recordatorioPath(id), { method: "PATCH", body: cambios });
}

/** Devuelve null cuando el backend responde 204. */
export function eliminarRecordatorio(id) {
  return request(recordatorioPath(id), { method: "DELETE" });
}
