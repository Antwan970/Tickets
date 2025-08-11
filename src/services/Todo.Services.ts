// services/Todo.Services.ts
import type { todo } from '../type/Todo';

export const fetchTodos = async (
  page = 0,
  pageSize = 5,
  search: string,
  property: string
): Promise<{ todos: todo[]; total: number }> => {
  const url =
    search && property
      ? `http://localhost:1337/api/todos?pagination[page]=${
          page + 1
        }&pagination[pageSize]=${pageSize}&filters[${property}][$contains]=${search}`
      : `http://localhost:1337/api/todos?pagination[page]=${
          page + 1
        }&pagination[pageSize]=${pageSize}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Failed to fetch todos from Strapi');
  }

  const json = await res.json();

  return json;
};
