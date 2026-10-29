import { pool } from "../config/database.js";

export async function findSubtareasByTareaIdAndUserId(tareaId, userId) {
  const [rows] = await pool.execute(
    `SELECT
       t.id_tarea AS tareaId,
       s.id_subtarea AS id,
       s.titulo,
       s.estado,
       s.orden,
       s.created_at AS createdAt,
       s.updated_at AS updatedAt
     FROM tarea t
     INNER JOIN materia m ON m.id_materia = t.id_materia
     LEFT JOIN subtarea s ON s.id_tarea = t.id_tarea
     WHERE t.id_tarea = ? AND m.id_usuario = ?
     ORDER BY s.orden ASC, s.id_subtarea ASC`,
    [tareaId, userId]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows
    .filter((row) => row.id !== null)
    .map((row) => ({
      id: row.id,
      tareaId: row.tareaId,
      titulo: row.titulo,
      estado: row.estado,
      orden: row.orden,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
}
