import { pool } from "../config/database.js";

const sortableFields = {
  id: "r.id_recordatorio",
  mensaje: "r.mensaje",
  fechaHora: "r.fecha_hora",
  canal: "r.canal",
  leido: "r.leido",
  tareaTitulo: "t.titulo",
  materiaNombre: "m.nombre",
  createdAt: "r.created_at"
};

function mapRecordatorio(row) {
  return {
    id: row.id,
    tareaId: row.tareaId,
    mensaje: row.mensaje,
    fechaHora: row.fechaHora,
    canal: row.canal,
    leido: Boolean(row.leido),
    createdAt: row.createdAt,
    tareaTitulo: row.tareaTitulo,
    tareaFechaEntrega: row.tareaFechaEntrega,
    materiaId: row.materiaId,
    materiaNombre: row.materiaNombre,
    materiaCodigo: row.materiaCodigo
  };
}

const recordatorioSelect = `SELECT
    r.id_recordatorio AS id,
    r.id_tarea AS tareaId,
    r.mensaje,
    r.fecha_hora AS fechaHora,
    r.canal,
    r.leido,
    r.created_at AS createdAt,
    t.titulo AS tareaTitulo,
    t.fecha_entrega AS tareaFechaEntrega,
    m.id_materia AS materiaId,
    m.nombre AS materiaNombre,
    m.codigo AS materiaCodigo
  FROM recordatorio r
  INNER JOIN tarea t ON t.id_tarea = r.id_tarea
  INNER JOIN materia m ON m.id_materia = t.id_materia`;

function buildConditions(userId, filters = {}) {
  const conditions = ["m.id_usuario = ?"];
  const params = [userId];

  if (typeof filters.leido === "boolean") {
    conditions.push("r.leido = ?");
    params.push(filters.leido ? 1 : 0);
  }

  if (filters.canal) {
    conditions.push("r.canal = ?");
    params.push(filters.canal);
  }

  if (filters.tareaId !== undefined) {
    conditions.push("r.id_tarea = ?");
    params.push(filters.tareaId);
  }

  if (filters.search) {
    conditions.push("(r.mensaje LIKE ? OR t.titulo LIKE ? OR m.nombre LIKE ?)");
    const term = `%${filters.search}%`;
    params.push(term, term, term);
  }

  return { conditions, params };
}

function normalizeSort(sort, order) {
  const column = sortableFields[sort] || sortableFields.fechaHora;
  const direction = order === "desc" ? "DESC" : "ASC";
  return `${column} ${direction}`;
}

export async function findAllByUserId(userId, filters = {}) {
  const { conditions, params } = buildConditions(userId, filters);
  const where = conditions.join(" AND ");
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM recordatorio r
     INNER JOIN tarea t ON t.id_tarea = r.id_tarea
     INNER JOIN materia m ON m.id_materia = t.id_materia
     WHERE ${where}`,
    params
  );

  const orderBy = normalizeSort(filters.sort, filters.order);
  const limit = filters.limit;
  const offset = (filters.page - 1) * limit;
  const [rows] = await pool.execute(
    `${recordatorioSelect}
     WHERE ${where}
     ORDER BY ${orderBy}, r.id_recordatorio ASC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    recordatorios: rows.map(mapRecordatorio),
    total: countRows[0].total
  };
}

export async function findByIdAndUserId(id, userId) {
  const [rows] = await pool.execute(
    `${recordatorioSelect}
     WHERE r.id_recordatorio = ? AND m.id_usuario = ?`,
    [id, userId]
  );

  return rows[0] ? mapRecordatorio(rows[0]) : null;
}

export async function taskBelongsToUser(taskId, userId) {
  const [rows] = await pool.execute(
    `SELECT t.id_tarea
     FROM tarea t
     INNER JOIN materia m ON m.id_materia = t.id_materia
     WHERE t.id_tarea = ? AND m.id_usuario = ?
     LIMIT 1`,
    [taskId, userId]
  );

  return rows.length > 0;
}

export async function createRecordatorio(userId, recordatorio) {
  const [result] = await pool.execute(
    `INSERT INTO recordatorio (id_tarea, mensaje, fecha_hora, canal, leido)
     SELECT ?, ?, ?, ?, ?
     WHERE EXISTS (
       SELECT 1
       FROM tarea t
       INNER JOIN materia m ON m.id_materia = t.id_materia
       WHERE t.id_tarea = ? AND m.id_usuario = ?
     )`,
    [
      recordatorio.idTarea,
      recordatorio.mensaje,
      recordatorio.fechaHora,
      recordatorio.canal,
      recordatorio.leido ? 1 : 0,
      recordatorio.idTarea,
      userId
    ]
  );

  if (result.affectedRows !== 1) {
    return null;
  }

  return findByIdAndUserId(result.insertId, userId);
}

export async function updateRecordatorio(id, userId, changes) {
  const columns = {
    idTarea: "id_tarea",
    mensaje: "mensaje",
    fechaHora: "fecha_hora",
    canal: "canal",
    leido: "leido"
  };
  const fields = [];
  const values = [];

  for (const [key, column] of Object.entries(columns)) {
    if (changes[key] !== undefined) {
      fields.push(`r.${column} = ?`);
      values.push(key === "leido" ? (changes[key] ? 1 : 0) : changes[key]);
    }
  }

  if (fields.length === 0) {
    return findByIdAndUserId(id, userId);
  }

  await pool.execute(
    `UPDATE recordatorio r
     INNER JOIN tarea t ON t.id_tarea = r.id_tarea
     INNER JOIN materia m ON m.id_materia = t.id_materia
     SET ${fields.join(", ")}
     WHERE r.id_recordatorio = ? AND m.id_usuario = ?`,
    [...values, id, userId]
  );

  return findByIdAndUserId(id, userId);
}

export async function deleteRecordatorio(id, userId) {
  const [result] = await pool.execute(
    `DELETE r
     FROM recordatorio r
     INNER JOIN tarea t ON t.id_tarea = r.id_tarea
     INNER JOIN materia m ON m.id_materia = t.id_materia
     WHERE r.id_recordatorio = ? AND m.id_usuario = ?`,
    [id, userId]
  );

  return result.affectedRows > 0;
}
