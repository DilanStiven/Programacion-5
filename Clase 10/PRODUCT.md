# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is the student completing this database assignment. The instructor also receives the frontend folder to inspect the result.

## Product Purpose

Provide a browser interface for the `proyectos` database so the student can manage its records and demonstrate the assignment. Success means being able to work with all four database sections through clear, reliable controls.

## Operating Context

The app runs locally with the existing Node.js API and MySQL/MariaDB database. The frontend is shared with the instructor as part of the assignment.

## Capabilities and Constraints

- The interface manages cities, clients, offices, and projects.
- The user confirmed that all four sections need create, read, update, and delete operations.
- The existing backend provides REST endpoints for these resources; the frontend should use those endpoints rather than bypassing the API.
- The frontend is plain HTML, CSS, and JavaScript served from the `front` directory.
- Spanish is the interface language.

## Product Principles

- Make all four database sections easy to find and distinguish.
- Keep common record-management actions straightforward.
- Reflect the actual data and relationships in the database.
- Make the assignment easy for the instructor to inspect.
