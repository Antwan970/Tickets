import React, { useState, useEffect } from "react";
import {
  TableRow,
  TableCell,
  TextField,
  Checkbox,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import type { Todo } from "../type/Todo";
import { fetchUsers } from "../services/users";

interface InlineAddRowProps {
  newTodo: Partial<Todo>;
  setNewTodo: (data: Partial<Todo>) => void;
  onAdd: (todo: Omit<Todo, "id">) => void;
  onCancel: () => void;
  errors: { todo?: string; userId?: string };
}

const InlineAddRow: React.FC<InlineAddRowProps> = ({
  newTodo,
  setNewTodo,
  onAdd,
  onCancel,
  errors,
}) => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers(1, 100, "", "")
      .then((res) => setUsers(res.users || []))
      .catch((err) => console.error("Failed to fetch users", err));
  }, []);

  return (
    <TableRow>
      <TableCell>—</TableCell>

      {/* Todo Text */}
      <TableCell>
        <TextField
          size="small"
          value={newTodo.todo || ""}
          onChange={(e) => setNewTodo({ ...newTodo, todo: e.target.value })}
          error={!!errors.todo}
          helperText={errors.todo}
        />
      </TableCell>

      {/* Completed Checkbox */}
      <TableCell>
        <Checkbox
          checked={newTodo.completed || false}
          onChange={(e) => setNewTodo({ ...newTodo, completed: e.target.checked })}
        />
      </TableCell>

      {/* User Dropdown */}
      <TableCell>
        <FormControl size="small" fullWidth error={!!errors.userId}>
          <InputLabel>User</InputLabel>
          <Select
            value={newTodo.userId || ""}
            onChange={(e) => setNewTodo({ ...newTodo, userId: e.target.value })}
            renderValue={(selected) => {
              if (!selected) return <em>Select User</em>;
              const user = users.find((u) => u.documentId === selected);
              return user ? `${user.FirstName} ${user.LastName}` : "";
            }}
          >
            <MenuItem disabled value="">
              <em>Select User</em>
            </MenuItem>
            {users.map((u) => (
              <MenuItem key={u.documentId} value={u.documentId}>
                {u.FirstName} {u.LastName}
              </MenuItem>
            ))}
          </Select>
          {errors.userId && <FormHelperText>{errors.userId}</FormHelperText>}
        </FormControl>
      </TableCell>

      {/* Save / Cancel */}
      <TableCell>
        <Button
          size="small"
          variant="contained"
          onClick={() =>
            onAdd({
              todo: newTodo.todo || "",
              completed: newTodo.completed || false,
              userId: newTodo.userId as string,
              documentId: "", // let backend generate
            })
          }
        >
          Save
        </Button>
        <Button size="small" onClick={onCancel}>
          Cancel
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default InlineAddRow;
