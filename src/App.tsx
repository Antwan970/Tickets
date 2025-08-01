// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import Todos from "./pages/todos";
import NewTodo from "./pages/createTodo";
import EditTodo from "./pages/EditTodo";
import Layout from "./components/Layout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected layout wrapper */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="todos" element={<Todos />} />
          <Route path="new-todo" element={<NewTodo />} />
          <Route path="edit-todo/:id" element={<EditTodo />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
