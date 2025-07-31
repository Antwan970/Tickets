// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import Todos from "./pages/todos";
import NewTodo from "./pages/createTodo";
import EditTodo from "./pages/EditTodo"; // ✅ Import the EditTodo component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/todos"
          element={
            <ProtectedRoute>
              <Todos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/new-todo"
          element={
            <ProtectedRoute>
              <NewTodo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-todo/:id"
          element={
            <ProtectedRoute>
              <EditTodo />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
