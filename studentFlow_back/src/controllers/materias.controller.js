import * as materiasService from "../services/materias.service.js";
import { sendNoContent, sendSuccess } from "../utils/api-response.js";

import {
    validateCreateMateria,
    validateMateriaListQuery,
    validateMateriaId,
    validatePatchMateria
} from "../validators/materias.validator.js";

/**
 * Controlador para listar las materias del usuario autenticado.
 *
 * @async
 * @function listMaterias
 * @param {Object} request - Objeto de solicitud de Express.
 * @param {Object} response - Objeto de respuesta de Express.
 * @param {Function} next - Middleware para manejar errores.
 * @returns {Promise<Object>} Respuesta HTTP con la colección de materias.
 */

export async function listMaterias(request, response, next) {
  try {
    const filters = validateMateriaListQuery(request.query);
    const result = await materiasService.listMaterias(request.user.id, filters);
    return sendSuccess(response, result.data, 200, result.meta);
  } catch (error) {
    return next(error);
  }
}

/**
 * Controlador para obtener una materia por su identificador.
 *
 * @async
 * @function getMateriaById
 * @param {Object} request - Objeto de solicitud de Express.
 * @param {Object} response - Objeto de respuesta de Express.
 * @param {Function} next - Middleware para manejar errores.
 * @returns {Promise<Object>} Respuesta HTTP con la materia solicitada.
 */

export async function getMateriaById(request, response, next) {
  try {

    const id  = validateMateriaId(request.params.id);
    const materia = await materiasService.getMateriaById(id, request.user.id);
    return sendSuccess(response, materia)

  } catch (error) {
    return next(error);
  }
}

/**
 * Controlador para crear una nueva materia.
 *
 * @async
 * @function createMateria
 * @param {Object} request - Objeto de solicitud de Express.
 * @param {Object} response - Objeto de respuesta de Express.
 * @param {Function} next - Middleware para manejar errores.
 * @returns {Promise<Object>} Respuesta HTTP con la materia creada.
 */

export async function createMateria(request, response, next) {
  try {
    const payload = validateCreateMateria(request.body);
    const materia = await materiasService.createMateria(request.user.id, payload);
    return sendSuccess(response, materia, 201);
  } catch (error) {
    return next(error);
  }
}

/**
 * Controlador para reemplazar por completo una materia existente.
 *
 * @async
 * @function replaceMateria
 * @param {Object} request - Objeto de solicitud de Express.
 * @param {Object} response - Objeto de respuesta de Express.
 * @param {Function} next - Middleware para manejar errores.
 * @returns {Promise<Object>} Respuesta HTTP con la materia reemplazada.
 */

export async function replaceMateria(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    const payload = validateCreateMateria(request.body);
    const materia = await materiasService.replaceMateria(id, request.user.id, payload);
    return sendSuccess(response, materia);
  } catch (error) {
    return next(error);
  }
}

/**
 * Controlador para actualizar parcialmente una materia.
 *
 * @async
 * @function updateMateria
 * @param {Object} request - Objeto de solicitud de Express.
 * @param {Object} response - Objeto de respuesta de Express.
 * @param {Function} next - Middleware para manejar errores.
 * @returns {Promise<Object>} Respuesta HTTP con la materia actualizada.
 */

export async function updateMateria(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    const payload = validatePatchMateria(request.body);
    const materia = await materiasService.updateMateria(id, request.user.id, payload);
    return sendSuccess(response, materia);
  } catch (error) {
    return next(error);
  }
}



/**
 * Controlador para listar todas las tareas asociadas a una materia del usuario.
 *
 * @async
 * @function getMateriasTareas
 * @param {Object} request - Objeto de solicitud de Express.
 * @param {Object} response - Objeto de respuesta de Express.
 * @param {Function} next - Middleware para manejar errores.
 * @returns {Promise<Object>} Respuesta HTTP con la lista de tareas de la materia.
 */

export async function getMateriasTareas(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    const tareas = await materiasService.listTareasByMateriaId(id, request.user.id);
    return sendSuccess(response, tareas);
  } catch (error) {
    return next(error);
  }
}

/**
 * Controlador para eliminar una materia.
 *
 * @async
 * @function deleteMateria
 * @param {Object} request - Objeto de solicitud de Express.
 * @param {Object} response - Objeto de respuesta de Express.
 * @param {Function} next - Middleware para manejar errores.
 * @returns {Promise<Object>} Respuesta HTTP sin contenido.
 */

export async function deleteMateria(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    await materiasService.removeMateria(id, request.user.id);
    return sendNoContent(response);
  } catch (error) {
    return next(error);
  }
}