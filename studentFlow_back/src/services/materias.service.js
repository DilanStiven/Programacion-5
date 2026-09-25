import * as materiasRepository from "../repositories/materias.repositorio.js";
import { HttpError } from "../utils/http-error.js";

/**
 * Obtiene la lista de materias asociadas a un usuario con filtros opcionales.
 *
 * @async
 * @function listMaterias
 * @param {string|number} userId - Identificador único del usuario propietario de las materias.
 * @param {Object} filters - Filtros de búsqueda y paginación aplicados a la consulta.
 * @param {boolean} [filters.activa] - Indica si se desea filtrar por materias activas o inactivas.
 * @param {string} [filters.search] - Término de búsqueda por nombre o código.
 * @param {string} [filters.sort] - Campo por el cual ordenar los resultados.
 * @param {string} [filters.order] - Dirección del orden: asc o desc.
 * @param {number} [filters.page=1] - Número de página a devolver.
 * @param {number} [filters.limit=20] - Cantidad máxima de registros por página.
 * @returns {Promise<Object>} Un objeto con la lista de materias y metadatos de paginación.
 */

export async function listMaterias(userId, filters) {
  const { materias, total } = await materiasRepository.findAllByUserId(userId, filters);

  return {
    data: materias,
    meta: {
      page: filters.page,
      limit: filters.limit,
      total,
      pages: Math.ceil(total / filters.limit)
    }
  };
}

/**
 * Recupera una materia específica perteneciente a un usuario.
 *
 * @async
 * @function getMateriaById
 * @param {string|number} id - Identificador único de la materia.
 * @param {string|number} userId - Identificador único del usuario propietario de la materia.
 * @returns {Promise<Object>} La materia encontrada.
 * @throws {HttpError} Código 404 si la materia no existe para el usuario indicado.
 */

export async function getMateriaById(id, userId) {

  const materia = await materiasRepository.findByIdAndUserId(id, userId);

  if (!materia) {
    throw new HttpError(404, "Materia_not_found", "No se encontró la materia con el ID proporcionado para el usuario especificado.");
  }

  return materia
}

/**
 * Crea una nueva materia validando que el código y nombre sean únicos para el usuario.
 *
 * @async
 * @function createMateria
 * @param {string|number} userId - Identificador único del usuario dueño de la materia.
 * @param {Object} materia - Objeto con los datos de la nueva materia.
 * @param {string} materia.codigo - Código único de la materia.
 * @param {string} materia.nombre - Nombre único de la materia.
 * @returns {Promise<Object>} La materia creada.
 * @throws {HttpError} Código 409 si el código o nombre ya existen para el usuario.
 */

export async function createMateria(userId, materia) {
  await ensureUniqueFields(userId, materia);
  return materiasRepository.createMateria(userId, materia);
}

/** 
* Valida que el código y el nombre de una materia sean únicos para un usuario específico.
* 
* @async
* @function ensureUniqueFields
* @param {string|number} userId - Identificador único del usuario dueño de la materia.
* @param {Object} materia - Objeto que contiene los datos de la materia a validar.
* @param {string} [materia.codigo] - Código identificador de la materia (opcional).
* @param {string} [materia.nombre] - Nombre de la materia (opcional).
* @param {string|number} [excludeId] - ID de una materia existente a excluir de la validación (útil en actualizaciones).
* 
* @returns {Promise} No retorna ningún valor si las validaciones son exitosas.
* 
* @throws {HttpError} Código 409 (DUPLICATE_CODE) si el código ya está registrado para el usuario.
* @throws {HttpError} Código 409 (DUPLICATE_NAME) si el nombre ya está registrado para el usuario.
*/

async function ensureUniqueFields(userId, materia, excludeId) {
  if (materia.codigo) {
    const duplicatedCode = await materiasRepository.existsByCode(userId, materia.codigo, excludeId);

    if (duplicatedCode) {
      throw new HttpError(409, "DUPLICATE_CODE", "Ya existe una materia con ese código.");
    }
  }

  if (materia.nombre) {
    const duplicatedName = await materiasRepository.existsByName(userId, materia.nombre, excludeId);

    if (duplicatedName) {
      throw new HttpError(409, "DUPLICATE_NAME", "Ya existe una materia con ese nombre.");
    }
  }
}

/**
 * Reemplaza completamente los datos de una materia existente.
 *
 * @async
 * @function replaceMateria
 * @param {string|number} id - Identificador único de la materia a reemplazar.
 * @param {string|number} userId - Identificador único del usuario propietario.
 * @param {Object} materia - Objeto con la nueva información de la materia.
 * @returns {Promise<Object>} La materia actualizada.
 * @throws {HttpError} Código 404 si la materia no existe para el usuario.
 */

export async function replaceMateria(id, userId, materia) {
  await getMateriaById(id, userId);
  await ensureUniqueFields(userId, materia, id);
  return materiasRepository.updateMateria(id, userId, materia);
}

/**
 * Actualiza parcialmente una materia existente.
 *
 * @async
 * @function updateMateria
 * @param {string|number} id - Identificador único de la materia a actualizar.
 * @param {string|number} userId - Identificador único del usuario propietario.
 * @param {Object} partialMateria - Campos parciales a modificar de la materia.
 * @returns {Promise<Object>} La materia actualizada con los cambios aplicados.
 * @throws {HttpError} Código 404 si la materia no existe para el usuario.
 */

export async function updateMateria(id, userId, partialMateria) {
  await getMateriaById(id, userId);
  await ensureUniqueFields(userId, partialMateria, id);
  return materiasRepository.patchMateria(id, userId, partialMateria);
}

/**
 * Obtiene todas las tareas asociadas a una materia del usuario autenticado.
 *
 * @async
 * @function listTareasByMateriaId
 * @param {string|number} id - Identificador único de la materia.
 * @param {string|number} userId - Identificador único del usuario propietario.
 * @returns {Promise<Array>} Lista de tareas pertenecientes a la materia.
 * @throws {HttpError} Código 404 si la materia no existe para el usuario indicado.
 */

export async function listTareasByMateriaId(id, userId) {
  await getMateriaById(id, userId);
  return materiasRepository.findTareasByMateriaIdAndUserId(id, userId);
}

/**
 * Elimina una materia del usuario autenticado.
 *
 * @async
 * @function removeMateria
 * @param {string|number} id - Identificador único de la materia a eliminar.
 * @param {string|number} userId - Identificador único del usuario propietario.
 * @returns {Promise<boolean>} True si la eliminación fue exitosa.
 * @throws {HttpError} Código 404 si la materia no existe para el usuario.
 */

export async function removeMateria(id, userId) {
  await getMateriaById(id, userId);
  await materiasRepository.deleteMateria(id, userId);
}
