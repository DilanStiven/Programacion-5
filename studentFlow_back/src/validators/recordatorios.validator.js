import { HttpError } from "../utils/http-error.js";

const canales = new Set(["in_app", "email"]);
const maxId = 4294967295;
const sortFields = new Set([
  "id", "mensaje", "fechaHora", "canal", "leido",
  "tareaTitulo", "materiaNombre", "createdAt"
]);

function requireObject(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(422, "VALIDATION_ERROR", "El cuerpo debe ser un objeto JSON.");
  }
}

function parseBoolean(value, fieldName) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new HttpError(422, "VALIDATION_ERROR", `El campo '${fieldName}' debe ser true o false.`);
}

function validateId(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maxId) {
    throw new HttpError(422, "VALIDATION_ERROR", `El campo '${fieldName}' debe ser un entero mayor que cero.`);
  }
  return parsed;
}

function validateMessage(value) {
  if (typeof value !== "string" || value.trim() === "" || value.trim().length > 255) {
    throw new HttpError(422, "VALIDATION_ERROR", "El mensaje es obligatorio y debe tener máximo 255 caracteres.");
  }
  return value.trim();
}

function validateDateTime(value) {
  if (typeof value !== "string") {
    throw new HttpError(422, "VALIDATION_ERROR", "La fecha y hora debe tener formato YYYY-MM-DDTHH:mm.");
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) {
    throw new HttpError(422, "VALIDATION_ERROR", "La fecha y hora debe tener formato YYYY-MM-DDTHH:mm.");
  }

  const [, yearText, monthText, dayText, hourText, minuteText, secondText = "00"] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day || hour > 23 || minute > 59 || second > 59
  ) {
    throw new HttpError(422, "VALIDATION_ERROR", "La fecha y hora no es válida.");
  }

  return `${yearText}-${monthText}-${dayText} ${hourText}:${minuteText}:${secondText}`;
}

function validateChannel(value) {
  if (!canales.has(value)) {
    throw new HttpError(422, "VALIDATION_ERROR", "El canal debe ser 'in_app' o 'email'.");
  }
  return value;
}

export function validateRecordatorioId(id) {
  const parsed = Number(id);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maxId) {
    throw new HttpError(400, "INVALID_ID", "El identificador del recordatorio no es válido.");
  }
  return parsed;
}

export function validateRecordatorioListQuery(query) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 20);
  if (!Number.isInteger(page) || page < 1) {
    throw new HttpError(422, "VALIDATION_ERROR", "El parámetro 'page' debe ser un entero mayor o igual a 1.");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new HttpError(422, "VALIDATION_ERROR", "El parámetro 'limit' debe ser un entero entre 1 y 100.");
  }

  const sort = query.sort ?? "fechaHora";
  const order = String(query.order ?? "asc").toLowerCase();
  if (!sortFields.has(sort)) {
    throw new HttpError(422, "VALIDATION_ERROR", "El parámetro 'sort' no es válido.");
  }
  if (!["asc", "desc"].includes(order)) {
    throw new HttpError(422, "VALIDATION_ERROR", "El parámetro 'order' debe ser asc o desc.");
  }

  let leido;
  if (query.leido !== undefined) {
    leido = parseBoolean(query.leido, "leido");
  }

  let tareaId;
  if (query.tareaId !== undefined) {
    tareaId = validateId(query.tareaId, "tareaId");
  }

  let canal;
  if (query.canal !== undefined && query.canal !== "") {
    canal = validateChannel(query.canal);
  }

  return {
    search: typeof query.search === "string" ? query.search.trim() : "",
    leido,
    tareaId,
    canal,
    sort,
    order,
    page,
    limit
  };
}

export function validateCreateRecordatorio(body) {
  requireObject(body);
  return {
    idTarea: validateId(body.idTarea, "idTarea"),
    mensaje: validateMessage(body.mensaje),
    fechaHora: validateDateTime(body.fechaHora),
    canal: body.canal === undefined ? "in_app" : validateChannel(body.canal),
    leido: body.leido === undefined ? false : parseBoolean(body.leido, "leido")
  };
}

export function validatePatchRecordatorio(body) {
  requireObject(body);
  const changes = {};
  if (body.idTarea !== undefined) changes.idTarea = validateId(body.idTarea, "idTarea");
  if (body.mensaje !== undefined) changes.mensaje = validateMessage(body.mensaje);
  if (body.fechaHora !== undefined) changes.fechaHora = validateDateTime(body.fechaHora);
  if (body.canal !== undefined) changes.canal = validateChannel(body.canal);
  if (body.leido !== undefined) changes.leido = parseBoolean(body.leido, "leido");
  if (Object.keys(changes).length === 0) {
    throw new HttpError(422, "VALIDATION_ERROR", "Envía al menos un campo válido para actualizar.");
  }
  return changes;
}
