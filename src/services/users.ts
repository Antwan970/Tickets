import type { Employee } from "../type/User";
import type { Todo } from "../type/Todo";
import { gql } from "@apollo/client";
import { client} from "../graphql/client"

const FETCH_EMPLOYEES = gql`
  query GetEmployees($page: Int, $pageSize: Int, $filters: EmployeeFiltersInput) {
    employees_connection(
      pagination: { page: $page, pageSize: $pageSize }
      filters: $filters
      
    ) {
      nodes {
        documentId
        FirstName
        LastName
        UserName
        Email
        Age
       
        todos {
          documentId
          todo
          completed
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

const FETCH_EMPLOYEE = gql`
  query GetEmployee($documentId: ID!) {
    employee(documentId: $documentId) {
      documentId
      FirstName
      LastName
      UserName
      Email
      Age
      # ✅ fetch related todos
      todos {
        documentId
        todo
        completed
      }
    }
  }
`;

const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($data: EmployeeInput!) {
    createEmployee(data: $data) {
      documentId
      FirstName
      LastName
      UserName
      Email
      Age
    }
  }
`;

const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($documentId: ID!, $data: EmployeeInput!) {
    updateEmployee(documentId: $documentId, data: $data) {
      documentId
      FirstName
      LastName
      UserName
      Email
      Age
    }
  }
`;

const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($documentId: ID!) {
    deleteEmployee(documentId: $documentId) {
      documentId
    }
  }
`;

interface PageInfo {
  pageSize: number;
  page: number;
  pageCount: number;
  total: number;
}

interface FetchEmployeesResponse {
  employees_connection: {
    nodes: (Employee & { todos?: Todo[] })[];
    pageInfo: PageInfo;
  };
}

interface FetchEmployeeResponse {
  employee: Employee & { todos?: Todo[] };
}

interface CreateEmployeeResponse {
  createEmployee: Employee;
}

interface UpdateEmployeeResponse {
  updateEmployee: Employee;
}

interface DeleteEmployeeResponse {
  deleteEmployee: { documentId: string };
}

export const fetchUsers = async (
  page: number,
  pageSize: number,
  search: string,
  property: string
): Promise<{ users: (Employee & { todos?: Todo[] })[]; pageInfo: PageInfo }> => {
  let filters: Record<string, unknown> | undefined = undefined;

  if (search && property) {
    if (property === "name") {
      filters = { FirstName: { contains: search } };
    } else if (property === "email") {
      filters = { Email: { contains: search } };
    } else if (property === "id") {
      filters = { documentId: { eq: search } };
    }
  }

  const { data } = await client.query<FetchEmployeesResponse>({
    query: FETCH_EMPLOYEES,
    variables: { page, pageSize, filters },
    fetchPolicy: "network-only",
  });

  return {
    users: data.employees_connection.nodes,
    pageInfo: data.employees_connection.pageInfo,
  };
};

export const fetchUser = async (documentId: string): Promise<Employee & { todos?: Todo[] }> => {
  const { data } = await client.query<FetchEmployeeResponse>({
    query: FETCH_EMPLOYEE,
    variables: { documentId },
  });
  return data.employee;
};

export const addUser = async (user: Employee): Promise<Employee> => {
  const { data } = await client.mutate<CreateEmployeeResponse>({
    mutation: CREATE_EMPLOYEE,
    variables: { data: user },
  });
  return data!.createEmployee;
};

export const updateUser = async (
  documentId: string,
  user: Employee
): Promise<Employee> => {
  const { data } = await client.mutate<UpdateEmployeeResponse>({
    mutation: UPDATE_EMPLOYEE,
    variables: { documentId, data: user },
  });
  return data!.updateEmployee;
};

export const deleteUser = async (
  documentId: string
): Promise<{ documentId: string }> => {
  const { data } = await client.mutate<DeleteEmployeeResponse>({
    mutation: DELETE_EMPLOYEE,
    variables: { documentId },
  });
  return data!.deleteEmployee;
};