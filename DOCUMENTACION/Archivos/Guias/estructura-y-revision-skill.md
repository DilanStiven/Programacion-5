# Estructura general y revisión de una skill

## Primera respuesta: estructura general de una skill

Una **skill es una carpeta con instrucciones reutilizables** para que Codex realice una tarea concreta. Su archivo principal es `SKILL.md`; los demás recursos son opcionales.

```text
mi-skill/
├── SKILL.md           # Obligatorio: descripción e instrucciones
├── agents/
│   └── openai.yaml    # Opcional: presentación y configuración de uso
├── scripts/           # Opcional: código para automatizar tareas
├── references/        # Opcional: documentación de apoyo
└── assets/            # Opcional: plantillas, imágenes y otros recursos
```

**El archivo `SKILL.md` tiene dos partes:**

1. **Cabecera YAML:** incluye `name` y `description`. La descripción explica qué hace la skill y cuándo debe utilizarse.
2. **Contenido Markdown:** explica cómo realizar la tarea, sus restricciones y el resultado esperado.

Por ejemplo:

```markdown
---
name: revisar-ejercicios-java
description: Revisa ejercicios de Java y explica errores de lógica y sintaxis. Úsala cuando el usuario solicite revisar una solución académica.
---

# Revisar ejercicios de Java

## Objetivo
Ayudar al estudiante a comprender y corregir su solución.

## Procedimiento
- Lee el enunciado y el código.
- Identifica errores y explica su causa.
- Propón correcciones acordes con el nivel del ejercicio.

## Restricciones
- Respeta las técnicas y bibliotecas permitidas por el enunciado.
- Si falta información esencial, solicítala.

## Resultado esperado
Una explicación de los problemas y las correcciones propuestas.
```

Los títulos del ejemplo son orientativos: **no existe una lista obligatoria de secciones**. Una skill sencilla puede funcionar únicamente con `SKILL.md`. Conviene añadir scripts, referencias o plantillas solo cuando aporten utilidad real.

## Segunda respuesta: relación con la skill adicionar-endpoint-api

El archivo [skill.md](D:/Downloads/camacho/2026B/programacionV/docs/skills/adicionar-endpoint-api/skill.md) sigue la estructura general que expliqué, con un procedimiento más detallado.

| Estructura general | Correspondencia en tu archivo |
|---|---|
| **Cabecera YAML** | `name: adicionar-endpoint-api` y `description`, que explican su nombre, función y alcance. |
| **Título principal** | **Adicionar un endpoint a una API existente**. |
| **Objetivo** | Está integrado en **Resultado esperado**: implementar el endpoint y verificar su comportamiento. |
| **Entradas necesarias** | **Entradas**: DER, información requerida, ubicación del backend y opciones del endpoint. Es una sección adicional útil. |
| **Procedimiento** | Se desarrolla en las seis secciones numeradas que aparecen abajo. |
| **Restricciones** | Están distribuidas dentro de cada paso: respetar la arquitectura, comprobar permisos, evitar cambios ajenos al encargo y no modificar producción. |
| **Resultado esperado y entrega** | Se define al inicio en **Resultado esperado** y se concreta al final en **6. Verificar y entregar**. |

Los subtítulos que corresponden al **procedimiento** son:

1. **Identificar el backend y sus convenciones**.
2. **Interpretar el DER y contrastarlo**.
3. **Definir el contrato de consulta**.
4. **Implementar el acceso a datos**.
5. **Conectar el endpoint**.
6. **Verificar y entregar**.

La organización es coherente: **presenta qué debe conseguir, qué necesita, cómo proceder y cómo verificar y entregar el resultado**. No necesitas separar las restricciones en otro apartado; ubicarlas junto al paso correspondiente facilita aplicarlas.

Como detalle de formato, conviene nombrar el archivo **`SKILL.md`**, en mayúsculas, conforme a la estructura indicada.
