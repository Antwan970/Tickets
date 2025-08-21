import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";

const token = localStorage.getItem("token");

const apolloClient = new ApolloClient({
  uri: "http://localhost:1337/graphql",
  cache: new InMemoryCache(),
  headers: token ? { Authorization: `Bearer ${token}` } : {},
});


const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={apolloClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ApolloProvider>
);
