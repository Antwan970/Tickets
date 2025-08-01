import type { Todo } from "../type/Todo";
const fetchTodos = async (
  page: number,
  limit: number,
  token: string | null
): Promise<{ todos: Todo[]; total: number }> => {
  const skip = page * limit;
  const res = await fetch(`https://dummyjson.com/auth/todos?limit=${limit}&skip=${skip}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch todos');

  return res.json();
};
export default fetchTodos;