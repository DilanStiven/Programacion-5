import {
  actualizarRecordatorio,
  crearRecordatorio,
  eliminarRecordatorio,
  listarRecordatorios,
  obtenerRecordatorio,
  reemplazarRecordatorio
} from "../api/recordatorios.js";

const listForm = document.querySelector("#listar-form");
const listStatus = document.querySelector("#listado-estado");
const tableBody = document.querySelector("#recordatorios-body");
const pagination = document.querySelector("#paginacion");
let currentPage = 1;
let totalPages = 1;

function setStatus(id, message, type) {
  const element = document.querySelector(`#${id}`);
  element.textContent = message;
  element.dataset.type = type;
}

function setBusy(form, busy) {
  for (const control of form.querySelectorAll("button")) {
    control.disabled = busy;
  }
}

function readForm(form) {
  return Object.fromEntries(new FormData(form));
}

function appendCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value ?? "—";
  row.append(cell);
}

function displayRecordatorio(recordatorio) {
  document.querySelector("#consultar-id").value = recordatorio.id;
  document.querySelector("#consultar-resultado").textContent = JSON.stringify(recordatorio, null, 2);
}

async function loadRecordatorios() {
  tableBody.replaceChildren();
  pagination.textContent = "";
  setStatus("listado-estado", "Consultando recordatorios…", "loading");

  const formValues = readForm(listForm);
  const filtros = {
    search: formValues.search.trim(),
    page: currentPage,
    limit: 20,
    sort: "fechaHora",
    order: "asc"
  };
  if (formValues.leido !== "") filtros.leido = formValues.leido;
  if (formValues.canal !== "") filtros.canal = formValues.canal;
  if (formValues.tareaId !== "") filtros.tareaId = formValues.tareaId;

  const response = await listarRecordatorios(filtros);
  totalPages = Math.max(response.meta.pages, 1);
  for (const item of response.data) {
    const row = document.createElement("tr");
    appendCell(row, item.id);
    appendCell(row, item.mensaje);
    appendCell(row, `${item.tareaTitulo} (#${item.tareaId})`);
    appendCell(row, `${item.materiaNombre} (${item.materiaCodigo})`);
    appendCell(row, item.fechaHora);
    appendCell(row, item.canal === "in_app" ? "Aplicación" : "Correo");
    appendCell(row, item.leido ? "Leído" : "No leído");

    const actionCell = document.createElement("td");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary";
    button.textContent = "Consultar";
    button.addEventListener("click", () => {
      document.querySelector("#consultar-id").value = item.id;
      document.querySelector("#consultar-form").requestSubmit();
    });
    actionCell.append(button);
    row.append(actionCell);
    tableBody.append(row);
  }

  pagination.textContent = `Mostrando ${response.data.length} de ${response.meta.total} recordatorios. Página ${currentPage} de ${totalPages}.`;
  setStatus(
    "listado-estado",
    response.data.length === 0 ? "No se encontraron recordatorios." : "Recordatorios consultados correctamente.",
    "success"
  );
  document.querySelector("#pagina-anterior").disabled = currentPage <= 1;
  document.querySelector("#pagina-siguiente").disabled = currentPage >= totalPages;
}

async function refreshList() {
  try {
    await loadRecordatorios();
  } catch (error) {
    console.error("No se pudieron consultar los recordatorios:", error);
    setStatus("listado-estado", error.message, "error");
  }
}

listForm.addEventListener("submit", async event => {
  event.preventDefault();
  currentPage = 1;
  await refreshList();
});

document.querySelector("#recargar").addEventListener("click", refreshList);
document.querySelector("#pagina-anterior").addEventListener("click", async () => {
  if (currentPage > 1) {
    currentPage -= 1;
    await refreshList();
  }
});
document.querySelector("#pagina-siguiente").addEventListener("click", async () => {
  if (currentPage < totalPages) {
    currentPage += 1;
    await refreshList();
  }
});

document.querySelector("#consultar-form").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  setBusy(form, true);
  setStatus("consultar-estado", "Consultando recordatorio…", "loading");
  try {
    const result = await obtenerRecordatorio(readForm(form).id);
    displayRecordatorio(result.data);
    setStatus("consultar-estado", "Recordatorio consultado correctamente.", "success");
  } catch (error) {
    console.error("No se pudo consultar el recordatorio:", error);
    document.querySelector("#consultar-resultado").textContent = "";
    setStatus("consultar-estado", error.message, "error");
  } finally {
    setBusy(form, false);
  }
});

document.querySelector("#crear-form").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  setBusy(form, true);
  setStatus("crear-estado", "Creando recordatorio…", "loading");
  try {
    const values = readForm(form);
    const result = await crearRecordatorio({
      idTarea: Number(values.idTarea),
      mensaje: values.mensaje.trim(),
      fechaHora: values.fechaHora,
      canal: values.canal,
      leido: form.elements.leido.checked
    });
    displayRecordatorio(result.data);
    setStatus("crear-estado", `Recordatorio creado. ID: ${result.data.id}.`, "success");
    form.reset();
    await refreshList();
  } catch (error) {
    console.error("No se pudo crear el recordatorio:", error);
    setStatus("crear-estado", error.message, "error");
  } finally {
    setBusy(form, false);
  }
});

document.querySelector("#reemplazar-form").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = readForm(form);
  setBusy(form, true);
  setStatus("reemplazar-estado", "Reemplazando recordatorio…", "loading");
  try {
    const result = await reemplazarRecordatorio(values.id, {
      idTarea: Number(values.idTarea),
      mensaje: values.mensaje.trim(),
      fechaHora: values.fechaHora,
      canal: values.canal,
      leido: form.elements.leido.checked
    });
    displayRecordatorio(result.data);
    setStatus("reemplazar-estado", "Recordatorio reemplazado correctamente.", "success");
    await refreshList();
  } catch (error) {
    console.error("No se pudo reemplazar el recordatorio:", error);
    setStatus("reemplazar-estado", error.message, "error");
  } finally {
    setBusy(form, false);
  }
});

document.querySelector("#actualizar-form").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = readForm(form);
  const changes = {};
  if (values.idTarea !== "") changes.idTarea = Number(values.idTarea);
  if (values.mensaje.trim() !== "") changes.mensaje = values.mensaje.trim();
  if (values.fechaHora !== "") changes.fechaHora = values.fechaHora;
  if (values.canal !== "") changes.canal = values.canal;
  if (values.leido !== "") changes.leido = values.leido === "true";

  setBusy(form, true);
  setStatus("actualizar-estado", "Aplicando cambios…", "loading");
  try {
    const result = await actualizarRecordatorio(values.id, changes);
    displayRecordatorio(result.data);
    setStatus("actualizar-estado", "Recordatorio actualizado correctamente.", "success");
    form.reset();
    await refreshList();
  } catch (error) {
    console.error("No se pudo actualizar el recordatorio:", error);
    setStatus("actualizar-estado", error.message, "error");
  } finally {
    setBusy(form, false);
  }
});

document.querySelector("#eliminar-form").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const id = readForm(form).id;
  if (!window.confirm(`¿Eliminar únicamente el recordatorio ${id}?`)) return;

  setBusy(form, true);
  setStatus("eliminar-estado", "Eliminando recordatorio…", "loading");
  try {
    await eliminarRecordatorio(id);
    setStatus("eliminar-estado", `Recordatorio ${id} eliminado correctamente.`, "success");
    document.querySelector("#consultar-resultado").textContent = "";
    await refreshList();
  } catch (error) {
    console.error("No se pudo eliminar el recordatorio:", error);
    setStatus("eliminar-estado", error.message, "error");
  } finally {
    setBusy(form, false);
  }
});

await refreshList();
