import { gql } from '@apollo/client';

export const GET_TODOS = gql`
  query GetTodos {
    todos {
      documentId
      todo
      completed
      userId
    }
  }
`;
