import { randomUUID } from 'node:crypto';

import { buildRoutePath } from '../utils/build-route-path.js';

import { Database } from '../database/database.js';

const database = new Database();

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const { search } = request.query;

      const tasks = database.select(
        'tasks',
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );
      return response.end(JSON.stringify(tasks));
    },
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const requireFields = ['title', 'description'];

      for (const field of requireFields) {
        if (!request.body[field]) {
          return response
            .writeHead(400)
            .end(JSON.stringify({ message: `Missing Param: ${field}` }));
        }
      }
      const { title, description } = request.body;

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      database.insert('tasks', task);

      return response.writeHead(201).end();
    },
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params;
      const { title, description } = request.body;

      const task = database.findOne('tasks', id);

      if (!task) {
        return response.writeHead(404).end();
      }

      database.update('tasks', id, {
        ...task,
        title: title ?? task.title,
        description: description ?? task.description,
        updated_at: new Date(),
      });

      return response.writeHead(204).end();
    },
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params;

      const task = database.findOne('tasks', id);

      if (!task) {
        return response.writeHead(404).end();
      }

      database.delete('tasks', id);

      return response.writeHead(204).end();
    },
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (request, response) => {
      const { id } = request.params;

      const task = database.findOne('tasks', id);

      if (!task) {
        return response.writeHead(404).end();
      }

      database.update('tasks', id, {
        ...task,
        updated_at: new Date(),
        completed_at: task.completed_at ? null : new Date(),
      });

      return response.writeHead(204).end();
    },
  },
];
