import { gql } from '@apollo/client';

export const CREATE_TODO = gql`
  mutation CreateTodo($data: TodoInput!) {
    createTodo(data: $data) {
      documentId
      todo
      completed
      userId
    }
  }
`;

export const UPDATE_TODO = gql`
  mutation UpdateTodo($id: ID!, $data: TodoInput!) {
    updateTodo(documentId: $id, data: $data) {
      documentId
      todo
      completed
      userId
    }
  }
`;

export const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(documentId: $id) {
      documentId
    }
  }
`;
