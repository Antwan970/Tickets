// src/graphql/Provider.tsx
import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client';

interface ProviderProps {
  children: React.ReactNode;
}

// Replace with your Strapi GraphQL endpoint
const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:1337/graphql', // Strapi GraphQL endpoint
  }),
  cache: new InMemoryCache(),
});

export const Provider: React.FC<ProviderProps> = ({ children }) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
