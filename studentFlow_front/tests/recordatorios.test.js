import test from "node:test";
import assert from "node:assert/strict";
import {
  actualizarRecordatorio,
  crearRecordatorio,
  eliminarRecordatorio,
  listarRecordatorios,
  obtenerRecordatorio,
  reemplazarRecordatorio
} from "../public/js/api/recordatorios.js";

test("las seis operaciones usan los métodos, rutas y cuerpos del CRUD de recordatorios", async t => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, ...options });
    return options.method === "DELETE"
      ? new Response(null, { status: 204 })
      : Response.json({ success: true, data: { id: 12 } });
  });

  await listarRecordatorios({ leido: false, tareaId: 3, canal: "in_app" });
  await obtenerRecordatorio(12);
  await crearRecordatorio({ idTarea: 3, mensaje: "Revisar entrega" });
  await reemplazarRecordatorio(12, { idTarea: 3, mensaje: "Nuevo mensaje" });
  await actualizarRecordatorio(12, { leido: true });
  assert.equal(await eliminarRecordatorio(12), null);

  assert.deepEqual(calls.map(({ url, method }) => [method, url]), [
    ["GET", "/api/v1/recordatorios?leido=false&tareaId=3&canal=in_app"],
    ["GET", "/api/v1/recordatorios/12"],
    ["POST", "/api/v1/recordatorios"],
    ["PUT", "/api/v1/recordatorios/12"],
    ["PATCH", "/api/v1/recordatorios/12"],
    ["DELETE", "/api/v1/recordatorios/12"]
  ]);
  assert.deepEqual(JSON.parse(calls[2].body), { idTarea: 3, mensaje: "Revisar entrega" });
  assert.deepEqual(JSON.parse(calls[4].body), { leido: true });
});

test("IDs inválidos no realizan solicitudes", t => {
  const fetchMock = t.mock.method(globalThis, "fetch", () => {
    throw new Error("No debería llamarse");
  });
  for (const id of [0, -1, "abc", 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => obtenerRecordatorio(id), TypeError);
  }
  assert.equal(fetchMock.mock.callCount(), 0);
});
