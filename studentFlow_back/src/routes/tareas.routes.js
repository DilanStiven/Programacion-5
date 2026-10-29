import { Router } from "express";
import { listSubtareasByTarea } from "../controllers/tareas.controller.js";

const router = Router();

router.get("/:id/subtareas", listSubtareasByTarea);

export default router;
