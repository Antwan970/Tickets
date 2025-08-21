import type { Todo } from '../type/Todo';
import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';


const token = localStorage.getItem('token') || sessionStorage.getItem('token');

const httpLink = createHttpLink({
  uri: 'http://localhost:1337/graphql',
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// ======================
// EXISTING TODOS QUERIES
// ======================
const FETCH_TODOS = gql`
  query GetTodos($page: Int, $pageSize: Int, $filters: TodoFiltersInput) {
    todos_connection(
      pagination: { page: $page, pageSize: $pageSize }
      filters: $filters
    
    ) {
      nodes {
        documentId
        todo
        completed
        userId {
        documentId
          FirstName
          LastName
        }
      }
      pageInfo {
        pageSize
        page
        pageCount
        total
      }
    }
  }
`;

const FETCH_TODO = gql`
  query GetTodo($documentId: ID!) {
    todo(documentId: $documentId) {
      documentId
      todo
      completed
      userId {
        documentId
        FirstName
        LastName
      }
    }
  }
`;

const CREATE_TODO = gql`
  mutation CreateTodo($data: TodoInput!) {
    createTodo(data: $data) {
      documentId
      todo
      completed
      userId {
        documentId
        FirstName
      }
    }
  }
`;

const UPDATE_TODO = gql`
  mutation UpdateTodo($documentId: ID!, $data: TodoInput!) {
    updateTodo(documentId: $documentId, data: $data) {
      documentId
      todo
      completed
      userId {
        documentId
        FirstName
        LastName
      }
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($documentId: ID!) {
    deleteTodo(documentId: $documentId) {
      documentId
    }
  }
`;

// ======================
// NEW: USERS WITH TODOS
// ======================
const FETCH_USERS_WITH_TODOS = gql`
  query GetUsersWithTodos {
    employees {
      data {
        id
        attributes {
          FirstName
          LastName
          Username
          Email
          Age
          todos {
            data {
              id
              attributes {
                todo
                completed
              }
            }
          }
        }
      }
    }
  }
`;


interface PageInfo {
  pageSize: number;
  page: number;
  pageCount: number;
  total: number;
}

interface FetchTodosResponse {
  todos_connection: {
    nodes: Todo[];
    pageInfo: PageInfo;
  };
}

interface FetchTodoResponse {
  todo: Todo;
}

interface CreateTodoResponse {
  createTodo: Todo;
}

interface UpdateTodoResponse {
  updateTodo: Todo;
}

interface DeleteTodoResponse {
  deleteTodo: { documentId: string };
}

// ======================
// HELPERS
// ======================
const mapFilterKey = (key: string) => {
  if (key === 'id') return 'documentId';
  return key;
};

// ======================
// API FUNCTIONS (EXISTING)
// ======================
export const fetchTodos = async (
  page: number,
  pageSize: number,
  search: string,
  property: string
): Promise<{ todos: Todo[]; pageInfo: PageInfo }> => {
  const filterKey = mapFilterKey(property);
  let filters: Record<string, unknown> | undefined = undefined;

  if (search && property) {
    if (filterKey === 'todo') {
      filters = { [filterKey]: { contains: search } };
    } else if (filterKey === 'userId') {
      filters = { userId: { documentId: { eq: search } } };
    } else if (filterKey === 'documentId') {
      filters = { documentId: { eq: search } };
    }
  }

  const { data } = await client.query<FetchTodosResponse>({
    query: FETCH_TODOS,
    variables: { page, pageSize, filters },
    fetchPolicy: 'network-only',
  });

  return {
    todos: data.todos_connection.nodes,
    pageInfo: data.todos_connection.pageInfo,
  };
};

export const fetchTodo = async (documentId: string): Promise<Todo> => {
  const { data } = await client.query<FetchTodoResponse>({
    query: FETCH_TODO,
    variables: { documentId },
  });
  return data.todo;
};

export const addTodo = async (todo: Todo): Promise<Todo> => {
  const { data } = await client.mutate<CreateTodoResponse>({
    mutation: CREATE_TODO,
    variables: {
      data: {
        todo: todo.todo,
        completed: todo.completed,
        userId: todo.userId // relation
      },
    },
  });
  return data!.createTodo;
};

export const updateTodo = async (
  documentId: string,
  todo: Todo
): Promise<Todo> => {
  const { data } = await client.mutate<UpdateTodoResponse>({
    mutation: UPDATE_TODO,
    variables: {
      documentId,
      data: {
        todo: todo.todo,
        completed: todo.completed,
        userId: todo.userId, // relation
      },
    },
  });
  return data!.updateTodo;
};

export const deleteTodo = async (
  documentId: string
): Promise<{ documentId: string }> => {
  const { data } = await client.mutate<DeleteTodoResponse>({
    mutation: DELETE_TODO,
    variables: { documentId },
  });
  return data!.deleteTodo;
};

// ======================
// NEW: FETCH USERS + TODOS
// ======================
export const fetchUsersWithTodos = async () => {
  const { data } = await client.query({
    query: FETCH_USERS_WITH_TODOS,
    fetchPolicy: 'network-only',
  });
  return data.employees.data;
};
