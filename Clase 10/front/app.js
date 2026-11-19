const API_ROOT = '/api/v1';
const PAGE_SIZE = 10;

const sections = {
  ciudades: {
    label: 'Ciudades',
    singular: 'ciudad',
    createLabel: 'Nueva ciudad',
    description: 'Consulta y administra las ciudades registradas en tu base de datos.',
    sortFields: [
      ['ciudad', 'Ciudad'],
      ['pais', 'País'],
      ['id', 'Identificador'],
    ],
    columns: [
      { key: 'id', label: 'ID', className: 'cell-id' },
      { key: 'ciudad', label: 'Ciudad' },
      { key: 'pais', label: 'País' },
    ],
    fields: [
      { name: 'ciudad', label: 'Ciudad', required: true, maxLength: 80, placeholder: 'Ej. Guadalajara' },
      { name: 'pais', label: 'País', required: true, maxLength: 80, placeholder: 'Ej. México' },
    ],
  },
  clientes: {
    label: 'Clientes',
    singular: 'cliente',
    createLabel: 'Nuevo cliente',
    description: 'Administra clientes y consulta la ciudad a la que pertenecen.',
    sortFields: [
      ['nombre', 'Nombre'],
      ['ciudad', 'Ciudad'],
      ['segmento', 'Tipo de cliente'],
      ['id', 'Identificador'],
    ],
    columns: [
      { key: 'id', label: 'ID', className: 'cell-id' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'ciudad', label: 'Ciudad' },
      { key: 'telefono', label: 'Teléfono' },
      { key: 'segmento', label: 'Tipo' },
    ],
    fields: [
      { name: 'nombre', label: 'Nombre', required: true, maxLength: 80, placeholder: 'Nombre del cliente' },
      { name: 'ciudadId', label: 'Ciudad', type: 'select', required: true, lookup: 'ciudades' },
      { name: 'telefono', label: 'Teléfono', maxLength: 20, placeholder: 'Opcional' },
      {
        name: 'segmento',
        label: 'Tipo de cliente',
        type: 'select',
        required: true,
        options: [['persona', 'Persona'], ['empresa', 'Empresa']],
      },
    ],
  },
  oficinas: {
    label: 'Oficinas',
    singular: 'oficina',
    createLabel: 'Nueva oficina',
    description: 'Administra las oficinas disponibles para asignar a tus proyectos.',
    sortFields: [['nombre', 'Nombre'], ['id', 'Identificador']],
    columns: [
      { key: 'id', label: 'ID', className: 'cell-id' },
      { key: 'nombre', label: 'Nombre de la oficina' },
    ],
    fields: [
      { name: 'nombre', label: 'Nombre de la oficina', required: true, maxLength: 80, placeholder: 'Ej. Oficina Bogotá' },
    ],
  },
  proyectos: {
    label: 'Proyectos',
    singular: 'proyecto',
    createLabel: 'Nuevo proyecto',
    description: 'Organiza proyectos, sus responsables, oficinas, fechas y costos.',
    sortFields: [
      ['proyecto', 'Nombre del proyecto'],
      ['fechaInicioProyecto', 'Fecha de inicio'],
      ['costoProyecto', 'Costo'],
      ['id', 'Identificador'],
    ],
    columns: [
      { key: 'id', label: 'ID', className: 'cell-id' },
      { key: 'proyecto', label: 'Proyecto' },
      { key: 'cliente', label: 'Cliente' },
      { key: 'oficina', label: 'Oficina' },
      { key: 'fechaInicioProyecto', label: 'Inicio' },
      { key: 'costoProyecto', label: 'Costo', className: 'cell-number' },
    ],
    fields: [
      { name: 'proyecto', label: 'Nombre del proyecto', required: true, maxLength: 80, placeholder: 'Nombre del proyecto' },
      { name: 'clienteId', label: 'Cliente', type: 'select', required: true, lookup: 'clientes' },
      { name: 'oficinaId', label: 'Oficina', type: 'select', required: true, lookup: 'oficinas' },
      { name: 'fechaInicioProyecto', label: 'Fecha y hora de inicio', type: 'datetime-local', requiredOnEdit: true },
      { name: 'fechaFinProyecto', label: 'Fecha de finalización', type: 'date' },
      { name: 'costoProyecto', label: 'Costo', type: 'number', min: '0', step: '0.01', placeholder: 'Opcional' },
    ],
  },
};

const state = {
  section: 'ciudades',
  page: 1,
  pages: 1,
  total: 0,
  search: '',
  sort: 'ciudad',
  order: 'asc',
  rows: [],
  counts: {},
  editing: null,
  requestId: 0,
  toastTimer: null,
};

const elements = {
  sidebar: document.querySelector('#sidebar'),
  menuToggle: document.querySelector('#menu-toggle'),
  navLinks: [...document.querySelectorAll('[data-section]')],
  pageTitle: document.querySelector('#page-title'),
  pageDescription: document.querySelector('#page-description'),
  breadcrumb: document.querySelector('#breadcrumb-current'),
  createButton: document.querySelector('#create-button'),
  createButtonLabel: document.querySelector('#create-button-label'),
  sectionTotal: document.querySelector('#section-total'),
  sectionTotalNote: document.querySelector('#section-total-note'),
  tableHeading: document.querySelector('#table-heading'),
  tableCaption: document.querySelector('#table-caption'),
  tableHead: document.querySelector('#table-head'),
  tableBody: document.querySelector('#table-body'),
  tableState: document.querySelector('#table-state'),
  tableWrap: document.querySelector('#table-wrap'),
  searchInput: document.querySelector('#search-input'),
  sortSelect: document.querySelector('#sort-select'),
  refreshButton: document.querySelector('#refresh-button'),
  rangeLabel: document.querySelector('#range-label'),
  pageLabel: document.querySelector('#page-label'),
  previousPage: document.querySelector('#previous-page'),
  nextPage: document.querySelector('#next-page'),
  connectionDot: document.querySelector('#connection-dot'),
  connectionLabel: document.querySelector('#connection-label'),
  dialog: document.querySelector('#record-dialog'),
  form: document.querySelector('#record-form'),
  formFields: document.querySelector('#form-fields'),
  formError: document.querySelector('#form-error'),
  dialogTitle: document.querySelector('#dialog-title'),
  dialogDescription: document.querySelector('#dialog-description'),
  saveButton: document.querySelector('#save-button'),
  dialogClose: document.querySelector('#dialog-close'),
  cancelButton: document.querySelector('#cancel-button'),
  toastRegion: document.querySelector('#toast-region'),
};

function icon(name) {
  const paths = {
    edit: '<path d="m14.5 6.5 3 3M4 20l4.6-.9L19 8.7a2.1 2.1 0 0 0-3-3L5.6 16.1 4 20Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    delete: '<path d="M4 7h16m-10 4v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  };
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = paths[name];
  return svg;
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_ROOT}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'content-type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('No se pudo contactar con el servidor. Comprueba que el backend esté iniciado y vuelve a intentarlo.');
  }

  if (response.status === 204) return null;

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('El servidor devolvió una respuesta que no se pudo leer. Inténtalo de nuevo.');
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.error?.message || 'No se pudo completar la operación. Inténtalo de nuevo.');
  }

  return payload;
}

function setConnection(connected) {
  elements.connectionDot.classList.toggle('is-connected', connected);
  elements.connectionDot.classList.toggle('is-disconnected', !connected);
  elements.connectionLabel.textContent = connected
    ? 'Base de datos conectada'
    : 'Sin conexión con la base';
}

function showToast(message, type = 'success') {
  window.clearTimeout(state.toastTimer);
  elements.toastRegion.replaceChildren();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  elements.toastRegion.append(toast);
  state.toastTimer = window.setTimeout(() => toast.remove(), 4200);
}

function setLoading(loading) {
  elements.refreshButton.disabled = loading;
  elements.refreshButton.classList.toggle('is-loading', loading);
  elements.tableWrap.classList.toggle('is-loading', loading);
}

function formatNumber(value) {
  return new Intl.NumberFormat('es-MX').format(Number(value) || 0);
}

function formatDate(value, includeTime = false) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const options = includeTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' };
  return new Intl.DateTimeFormat('es-MX', options).format(date);
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '—';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(Number(value));
}

function renderSectionChrome() {
  const section = sections[state.section];
  elements.pageTitle.textContent = section.label;
  elements.pageDescription.textContent = section.description;
  elements.breadcrumb.textContent = section.label;
  elements.createButtonLabel.textContent = section.createLabel;
  elements.sectionTotal.textContent = formatNumber(state.counts[state.section]);
  elements.sectionTotalNote.textContent = 'Registros guardados';
  elements.tableHeading.textContent = `Registros de ${section.label.toLowerCase()}`;
  elements.tableCaption.textContent = 'Revisa, filtra o actualiza la información.';
  elements.navLinks.forEach((link) => {
    const active = link.dataset.section === state.section;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  elements.sortSelect.replaceChildren();
  section.sortFields.forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    elements.sortSelect.append(option);
  });
  if (section.sortFields.some(([value]) => value === state.sort)) {
    elements.sortSelect.value = state.sort;
  } else {
    state.sort = section.sortFields[0][0];
    elements.sortSelect.value = state.sort;
  }
}

function setTableState(message, actionLabel = '', action) {
  elements.tableHead.replaceChildren();
  elements.tableBody.replaceChildren();
  elements.tableState.hidden = false;
  elements.tableState.replaceChildren();

  const messageNode = document.createElement('p');
  messageNode.textContent = message;
  elements.tableState.append(messageNode);

  if (actionLabel && action) {
    const button = document.createElement('button');
    button.className = 'button button-quiet';
    button.type = 'button';
    button.textContent = actionLabel;
    button.addEventListener('click', action, { once: true });
    elements.tableState.append(button);
  }
}

function renderTable(rows) {
  const section = sections[state.section];
  elements.tableState.hidden = true;
  elements.tableState.replaceChildren();
  const headingRow = document.createElement('tr');

  section.columns.forEach((column) => {
    const heading = document.createElement('th');
    heading.scope = 'col';
    heading.textContent = column.label;
    if (column.className) heading.className = column.className;
    headingRow.append(heading);
  });

  const actionsHeading = document.createElement('th');
  actionsHeading.scope = 'col';
  actionsHeading.className = 'actions-heading';
  actionsHeading.textContent = 'Acciones';
  headingRow.append(actionsHeading);
  elements.tableHead.replaceChildren(headingRow);

  if (!rows.length) {
    elements.tableBody.replaceChildren();
    setTableState(
      state.search
        ? 'No encontramos registros con esa búsqueda. Prueba con otra palabra.'
        : 'Todavía no hay registros en esta sección. Puedes crear el primero.',
      state.search ? 'Limpiar búsqueda' : `Crear ${section.singular}`,
      state.search
        ? () => {
            elements.searchInput.value = '';
            state.search = '';
            state.page = 1;
            loadSection();
          }
        : () => openForm(),
    );
    return;
  }

  const fragment = document.createDocumentFragment();
  rows.forEach((record) => {
    const row = document.createElement('tr');
    row.className = 'data-row';
    section.columns.forEach((column) => {
      const cell = document.createElement('td');
      if (column.className) cell.className = column.className;
      cell.dataset.label = column.label;
      const value = getCellValue(state.section, record, column.key);
      if (value instanceof Node) cell.append(value);
      else cell.textContent = value;
      row.append(cell);
    });

    const actions = document.createElement('td');
    actions.className = 'row-actions';
    actions.dataset.label = 'Acciones';

    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'row-action';
    edit.setAttribute('aria-label', `Editar ${sections[state.section].singular} ${getRecordName(record)}`);
    edit.append(icon('edit'));
    const editLabel = document.createElement('span');
    editLabel.textContent = 'Editar';
    edit.append(editLabel);
    edit.addEventListener('click', () => openForm(record));

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'row-action row-action-delete';
    remove.setAttribute('aria-label', `Eliminar ${sections[state.section].singular} ${getRecordName(record)}`);
    remove.append(icon('delete'));
    const removeLabel = document.createElement('span');
    removeLabel.textContent = 'Eliminar';
    remove.append(removeLabel);
    remove.addEventListener('click', () => deleteRecord(record));

    actions.append(edit, remove);
    row.append(actions);
    fragment.append(row);
  });
  elements.tableBody.replaceChildren(fragment);
}

function getCellValue(section, record, key) {
  if (section === 'clientes') {
    if (key === 'ciudad') return record.ciudad?.ciudad || '—';
    if (key === 'segmento') return createTag(record.segmento === 'empresa' ? 'Empresa' : 'Persona');
  }
  if (section === 'proyectos') {
    if (key === 'cliente') return record.cliente?.nombre || '—';
    if (key === 'oficina') return record.oficina?.nombre || '—';
    if (key === 'fechaInicioProyecto') return formatDate(record.fechaInicioProyecto, true);
    if (key === 'costoProyecto') return formatCurrency(record.costoProyecto);
  }
  if (key === 'telefono') return record.telefono || '—';
  return record[key] === null || record[key] === undefined || record[key] === ''
    ? '—'
    : String(record[key]);
}

function createTag(label) {
  const tag = document.createElement('span');
  tag.className = 'status-tag';
  tag.textContent = label;
  return tag;
}

function getRecordName(record) {
  if (record.nombre) return record.nombre;
  if (record.ciudad) return record.ciudad;
  if (record.proyecto) return record.proyecto;
  return `#${record.id}`;
}

function renderPagination() {
  const first = state.total === 0 ? 0 : (state.page - 1) * PAGE_SIZE + 1;
  const last = Math.min(state.page * PAGE_SIZE, state.total);
  elements.rangeLabel.textContent = `Mostrando ${formatNumber(first)}–${formatNumber(last)} de ${formatNumber(state.total)} registros`;
  elements.pageLabel.textContent = `Página ${state.page} de ${state.pages}`;
  elements.previousPage.disabled = state.page <= 1;
  elements.nextPage.disabled = state.page >= state.pages;
}

async function loadSection() {
  const requestId = ++state.requestId;
  setLoading(true);
  try {
    const params = new URLSearchParams({
      page: String(state.page),
      limit: String(PAGE_SIZE),
      sort: state.sort,
      order: state.order,
    });
    if (state.search) params.set('search', state.search);
    const payload = await request(`/${state.section}?${params}`);
    if (requestId !== state.requestId) return false;
    state.rows = payload.data;
    state.total = Number(payload.meta.total);
    state.pages = Math.max(1, Number(payload.meta.pages));
    if (state.page > state.pages) {
      state.page = state.pages;
      return loadSection();
    }
    elements.sectionTotal.textContent = formatNumber(state.counts[state.section] ?? state.total);
    elements.sectionTotalNote.textContent = 'Registros guardados';
    renderTable(state.rows);
    renderPagination();
    return true;
  } catch (error) {
    if (requestId !== state.requestId) return false;
    setTableState(error.message, 'Reintentar', loadSection);
    elements.rangeLabel.textContent = 'No se pudieron cargar los registros';
    elements.pageLabel.textContent = `Página ${state.page} de ${state.pages}`;
    showToast(error.message, 'error');
    return false;
  } finally {
    if (requestId === state.requestId) setLoading(false);
  }
}

async function refreshCounts() {
  const results = await Promise.all(
    Object.keys(sections).map(async (name) => {
      const payload = await request(`/${name}?page=1&limit=1`);
      return [name, Number(payload.meta.total)];
    }),
  );
  state.counts = Object.fromEntries(results);
  document.querySelectorAll('[data-count]').forEach((node) => {
    node.textContent = formatNumber(state.counts[node.dataset.count]);
  });
  document.querySelectorAll('[data-overview-count]').forEach((node) => {
    node.textContent = formatNumber(state.counts[node.dataset.overviewCount]);
  });
  elements.sectionTotal.textContent = formatNumber(state.counts[state.section]);
}

async function checkConnection() {
  try {
    await request('/health');
    setConnection(true);
  } catch {
    setConnection(false);
  }
}

async function loadLookup(section) {
  const records = [];
  let page = 1;
  let pages = 1;
  do {
    const payload = await request(`/${section}?page=${page}&limit=100&sort=${section === 'ciudades' ? 'ciudad' : 'nombre'}`);
    records.push(...payload.data);
    pages = Number(payload.meta.pages);
    page += 1;
  } while (page <= pages);
  return records;
}

function setFieldLabel(field, input) {
  const label = document.createElement('label');
  label.className = 'form-field';
  const caption = document.createElement('span');
  caption.textContent = field.label;
  if (field.required || (field.requiredOnEdit && state.editing)) {
    const required = document.createElement('span');
    required.className = 'required-mark';
    required.textContent = ' *';
    caption.append(required);
  }
  label.append(caption, input);
  return label;
}

async function makeInput(field, value) {
  const input = field.type === 'select'
    ? document.createElement('select')
    : document.createElement('input');
  input.name = field.name;
  input.id = `field-${field.name}`;
  input.autocomplete = 'off';
  if (field.type && field.type !== 'select') input.type = field.type;
  if (field.required || (field.requiredOnEdit && state.editing)) input.required = true;
  if (field.maxLength) input.maxLength = field.maxLength;
  if (field.placeholder) input.placeholder = field.placeholder;
  if (field.min !== undefined) input.min = field.min;
  if (field.step !== undefined) input.step = field.step;

  if (field.options) {
    field.options.forEach(([optionValue, label]) => {
      const option = document.createElement('option');
      option.value = optionValue;
      option.textContent = label;
      input.append(option);
    });
  } else if (field.lookup) {
    input.disabled = true;
    const loading = document.createElement('option');
    loading.value = '';
    loading.textContent = 'Cargando opciones…';
    input.append(loading);
    try {
      const records = await loadLookup(field.lookup);
      input.replaceChildren();
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Selecciona una opción';
      input.append(placeholder);
      records.forEach((record) => {
        const option = document.createElement('option');
        option.value = record.id;
        option.textContent = field.lookup === 'ciudades'
          ? `${record.ciudad}, ${record.pais}`
          : record.nombre;
        input.append(option);
      });
    } finally {
      input.disabled = false;
    }
  }

  if (value !== null && value !== undefined) {
    input.value = field.type === 'datetime-local'
      ? toDateTimeInput(value)
      : String(value);
  }
  return setFieldLabel(field, input);
}

function toDateTimeInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).replace(' ', 'T').slice(0, 16);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function toApiDateTime(value) {
  return value ? `${value.replace('T', ' ')}:00` : undefined;
}

async function openForm(record = null) {
  state.editing = record;
  const section = sections[state.section];
  elements.dialogTitle.textContent = record
    ? `Editar ${section.singular}`
    : `Nuevo ${section.singular}`;
  elements.dialogDescription.textContent = record
    ? `Actualiza la información de ${getRecordName(record)}.`
    : 'Completa los datos para guardar el registro.';
  elements.saveButton.textContent = record ? 'Guardar cambios' : 'Guardar registro';
  elements.formError.hidden = true;
  elements.formFields.replaceChildren();
  elements.saveButton.disabled = true;
  elements.dialog.showModal();

  try {
    const controls = await Promise.all(section.fields.map(async (field) => {
      const value = record ? record[field.name] : undefined;
      return makeInput(field, value);
    }));
    elements.formFields.replaceChildren(...controls);
    elements.saveButton.disabled = false;
    elements.formFields.querySelector('input, select')?.focus();
  } catch (error) {
    showFormError(error.message);
    showToast(error.message, 'error');
  }
}

function closeForm() {
  if (elements.dialog.open) elements.dialog.close();
  state.editing = null;
  elements.form.reset();
  elements.formFields.replaceChildren();
  elements.formError.hidden = true;
  elements.saveButton.disabled = false;
}

function showFormError(message) {
  elements.formError.textContent = message;
  elements.formError.hidden = false;
}

async function submitForm(event) {
  event.preventDefault();
  const section = sections[state.section];
  const body = {};
  new FormData(elements.form).forEach((value, key) => {
    const field = section.fields.find((item) => item.name === key);
    if (field.type === 'number') body[key] = value === '' ? null : Number(value);
    else if (field.type === 'datetime-local') {
      const normalized = toApiDateTime(value);
      if (normalized) body[key] = normalized;
    } else if (value === '') body[key] = null;
    else body[key] = value;
  });

  elements.saveButton.disabled = true;
  elements.saveButton.textContent = state.editing ? 'Guardando…' : 'Creando…';
  elements.formError.hidden = true;
  try {
    const method = state.editing ? 'PUT' : 'POST';
    const suffix = state.editing ? `/${state.editing.id}` : '';
    await request(`/${state.section}${suffix}`, {
      method,
      body: JSON.stringify(body),
    });
  } catch (error) {
    showFormError(error.message);
    elements.saveButton.disabled = false;
    elements.saveButton.textContent = state.editing ? 'Guardar cambios' : 'Guardar registro';
    return;
  }

  const wasEditing = Boolean(state.editing);
  closeForm();
  showToast(wasEditing ? 'Los cambios se guardaron correctamente.' : `Se agregó ${section.singular} correctamente.`);
  const results = await Promise.allSettled([refreshCounts(), loadSection()]);
  if (results[0].status === 'rejected') {
    showToast('El registro se guardó, pero no se pudo actualizar el resumen. Vuelve a intentarlo.', 'error');
  }
}

async function deleteRecord(record) {
  const label = getRecordName(record);
  const confirmed = window.confirm(`¿Eliminar ${sections[state.section].singular} "${label}"?\n\nEsta acción no se puede deshacer.`);
  if (!confirmed) return;

  try {
    await request(`/${state.section}/${record.id}`, { method: 'DELETE' });
    showToast('El registro se eliminó correctamente.');
  } catch (error) {
    showToast(error.message, 'error');
    return;
  }

  const results = await Promise.allSettled([refreshCounts(), loadSection()]);
  if (results[0].status === 'rejected') {
    showToast('El registro se eliminó, pero no se pudo actualizar el resumen. Vuelve a intentarlo.', 'error');
  }
}

function switchSection(section) {
  if (!sections[section] || section === state.section) return;
  state.section = section;
  state.page = 1;
  state.search = '';
  state.order = 'asc';
  elements.searchInput.value = '';
  renderSectionChrome();
  renderPagination();
  loadSection();
  elements.sidebar.classList.remove('is-open');
  elements.menuToggle.setAttribute('aria-expanded', 'false');
}

let searchTimer;
elements.navLinks.forEach((link) => {
  link.addEventListener('click', () => switchSection(link.dataset.section));
});

elements.createButton.addEventListener('click', () => openForm());
elements.refreshButton.addEventListener('click', async () => {
  try {
    const [, loaded] = await Promise.all([refreshCounts(), loadSection(), checkConnection()]);
    if (!loaded) return;
    showToast('La información está actualizada.');
  } catch (error) {
    showToast(error.message, 'error');
  }
});
elements.searchInput.addEventListener('input', () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    state.search = elements.searchInput.value.trim();
    state.page = 1;
    loadSection();
  }, 250);
});
elements.sortSelect.addEventListener('change', () => {
  state.sort = elements.sortSelect.value;
  state.page = 1;
  loadSection();
});
elements.previousPage.addEventListener('click', () => {
  if (state.page <= 1) return;
  state.page -= 1;
  loadSection();
});
elements.nextPage.addEventListener('click', () => {
  if (state.page >= state.pages) return;
  state.page += 1;
  loadSection();
});
elements.form.addEventListener('submit', submitForm);
elements.dialogClose.addEventListener('click', closeForm);
elements.cancelButton.addEventListener('click', closeForm);
elements.dialog.addEventListener('click', (event) => {
  if (event.target === elements.dialog) closeForm();
});
elements.dialog.addEventListener('close', () => {
  state.editing = null;
});
elements.menuToggle.addEventListener('click', () => {
  const open = elements.sidebar.classList.toggle('is-open');
  elements.menuToggle.setAttribute('aria-expanded', String(open));
});

async function initialize() {
  renderSectionChrome();
  renderPagination();
  await Promise.all([
    checkConnection(),
    refreshCounts().catch((error) => {
      showToast(error.message, 'error');
      throw error;
    }),
    loadSection(),
  ]);
}

initialize().catch((error) => {
  setConnection(false);
  setTableState(error.message, 'Reintentar', initialize);
});
