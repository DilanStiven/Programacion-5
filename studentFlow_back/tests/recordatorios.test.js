import test from "node:test";
import assert from "node:assert/strict";
import { pool } from "../src/config/database.js";
import {
  createRecordatorio,
  deleteRecordatorio,
  findAllByUserId,
  updateRecordatorio
} from "../src/repositories/recordatorios.repositorio.js";
import {
  validateCreateRecordatorio,
  validatePatchRecordatorio,
  validateRecordatorioId,
  validateRecordatorioListQuery
} from "../src/validators/recordatorios.validator.js";
import { createRecordatorio as createRecordatorioService } from "../src/services/recordatorios.service.js";

const row = {
  id: 12,
  tareaId: 3,
  mensaje: "Revisar entrega",
  fechaHora: "2026-10-30 09:00:00",
  canal: "in_app",
  leido: 0,
  createdAt: "2026-10-29 12:00:00",
  tareaTitulo: "Entrega del proyecto",
  tareaFechaEntrega: "2026-10-31",
  materiaId: 2,
  materiaNombre: "Desarrollo Web",
  materiaCodigo: "WEB-204"
};

test("los filtros y el contrato de entrada de recordatorios se validan", () => {
  assert.deepEqual(validateRecordatorioListQuery({
    leido: "false",
    tareaId: "3",
    canal: "email",
    page: "2",
    limit: "5",
    sort: "materiaNombre",
    order: "desc"
  }), {
    search: "",
    leido: false,
    tareaId: 3,
    canal: "email",
    sort: "materiaNombre",
    order: "desc",
    page: 2,
    limit: 5
  });

  assert.deepEqual(validateCreateRecordatorio({
    idTarea: "3",
    mensaje: "  Revisar entrega  ",
    fechaHora: "2026-10-30T09:00",
    canal: "in_app"
  }), {
    idTarea: 3,
    mensaje: "Revisar entrega",
    fechaHora: "2026-10-30 09:00:00",
    canal: "in_app",
    leido: false
  });
  assert.deepEqual(validatePatchRecordatorio({ leido: false }), { leido: false });
  assert.throws(() => validateRecordatorioId("4294967296"), { code: "INVALID_ID" });

  for (const payload of [
    { idTarea: 0, mensaje: "x", fechaHora: "2026-10-30T09:00" },
    { idTarea: 3, mensaje: "x", fechaHora: "2026-02-30T09:00" },
    { idTarea: 3, mensaje: "x", fechaHora: "2026-10-30T09:00", canal: "sms" }
  ]) {
    assert.throws(() => validateCreateRecordatorio(payload), { code: "VALIDATION_ERROR" });
  }
  assert.throws(() => validateRecordatorioListQuery({ sort: "r.mensaje" }), {
    code: "VALIDATION_ERROR"
  });
});

test("el listado filtra por propietario y mapea las relaciones sin duplicar registros", async t => {
  const calls = [];
  t.mock.method(pool, "execute", async (sql, params) => {
    calls.push({ sql, params });
    return calls.length === 1
      ? [[{ total: 1 }], []]
      : [[row], []];
  });

  const result = await findAllByUserId(7, {
    leido: false,
    canal: "in_app",
    tareaId: 3,
    search: "entrega",
    sort: "fechaHora",
    order: "desc",
    page: 1,
    limit: 10
  });

  assert.equal(result.total, 1);
  assert.deepEqual(result.recordatorios, [{
    id: 12,
    tareaId: 3,
    mensaje: "Revisar entrega",
    fechaHora: "2026-10-30 09:00:00",
    canal: "in_app",
    leido: false,
    createdAt: "2026-10-29 12:00:00",
    tareaTitulo: "Entrega del proyecto",
    tareaFechaEntrega: "2026-10-31",
    materiaId: 2,
    materiaNombre: "Desarrollo Web",
    materiaCodigo: "WEB-204"
  }]);
  assert.ok(calls.every(({ sql }) => sql.includes("m.id_usuario = ?")));
  assert.ok(calls[1].sql.includes("INNER JOIN tarea"));
  assert.ok(calls[1].sql.includes("INNER JOIN materia"));
  assert.deepEqual(calls[0].params, [7, 0, "in_app", 3, "%entrega%", "%entrega%", "%entrega%"]);
  assert.deepEqual(calls[1].params.slice(-2), [10, 0]);
});

test("las operaciones de escritura solo insertan, actualizan o eliminan recordatorio", async t => {
  const calls = [];
  t.mock.method(pool, "execute", async (sql, params) => {
    calls.push({ sql, params });
    if (sql.startsWith("INSERT")) return [{ affectedRows: 1, insertId: 12 }, []];
    if (sql.startsWith("UPDATE")) return [{ affectedRows: 1 }, []];
    if (sql.startsWith("DELETE")) return [{ affectedRows: 1 }, []];
    return [[row], []];
  });

  assert.equal((await createRecordatorio(7, {
    idTarea: 3,
    mensaje: row.mensaje,
    fechaHora: row.fechaHora,
    canal: "in_app",
    leido: false
  })).id, 12);
  assert.equal((await updateRecordatorio(12, 7, { leido: true })).id, 12);
  assert.equal(await deleteRecordatorio(12, 7), true);

  const writes = calls.filter(({ sql }) => /^(INSERT|UPDATE|DELETE)/.test(sql.trim()));
  assert.equal(writes.length, 3);
  assert.match(writes[0].sql, /^INSERT INTO recordatorio/);
  assert.match(writes[1].sql, /^UPDATE recordatorio/);
  assert.match(writes[1].sql, /SET r\.leido = \?/);
  assert.match(writes[2].sql, /^DELETE r\s+FROM recordatorio/);
  assert.ok(writes.every(({ sql }) => !/UPDATE (?:tarea|materia)|DELETE (?:tarea|materia)|INSERT INTO (?:tarea|materia)/i.test(sql)));
});

test("no crea recordatorios para tareas ajenas al usuario", async t => {
  const calls = [];
  t.mock.method(pool, "execute", async (sql, params) => {
    calls.push({ sql, params });
    return [[], []];
  });

  await assert.rejects(
    createRecordatorioService(7, {
      idTarea: 3,
      mensaje: "Revisar entrega",
      fechaHora: "2026-10-30 09:00:00",
      canal: "in_app",
      leido: false
    }),
    { statusCode: 404, code: "TAREA_NOT_FOUND" }
  );
  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /FROM tarea t[\s\S]+INNER JOIN materia m/);
  assert.deepEqual(calls[0].params, [3, 7]);
});
