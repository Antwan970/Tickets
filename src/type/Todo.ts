import type {Employee, UserItem} from "./User";

export type Todo = {
  id: number; 
  todo: string;
  completed: boolean;
  userId: Employee;
};

export interface TodoItem {
  id: number;
  Todo: string;
  Completed: boolean | null;
  userId: UserItem;
}


export type TodoResponse = {
  data: TodoItem[];
  meta: {
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    };
  };
};