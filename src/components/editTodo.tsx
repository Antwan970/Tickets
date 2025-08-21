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

interface InlineEditRowProps {
  todo: Todo;
  editData: Partial<Todo>;
  setEditData: (data: Partial<Todo>) => void;
  onSave: () => void;
  onCancel: () => void;
  errors: { todo?: string; userId?: string };
}

const InlineEditRow: React.FC<InlineEditRowProps> = ({
  todo,
  editData,
  setEditData,
  onSave,
  onCancel,
  errors,
}) => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers(1, 100, "", "")
      .then((res) => {
        setUsers(res.users || []);
      })
      .catch((err) => console.error("Failed to fetch users", err));
  }, []);

  return (
    <TableRow>
      <TableCell>{todo.id}</TableCell>

      {/* Todo Text */}
      <TableCell>
        <TextField
          size="small"
          value={editData.todo || ""}
          onChange={(e) => setEditData({ ...editData, todo: e.target.value })}
          error={!!errors.todo}
          helperText={errors.todo}
        />
      </TableCell>

      {/* Completed Checkbox */}
      <TableCell>
        <Checkbox
          checked={editData.completed || false}
          onChange={(e) =>
            setEditData({ ...editData, completed: e.target.checked })
          }
        />
      </TableCell>

      {/* User Dropdown */}
      <TableCell>
        <FormControl size="small" fullWidth error={!!errors.userId}>
          <InputLabel>User</InputLabel>
          <Select
            value={editData.userId || ""}
            onChange={(e) => {
              // ✅ only store the documentId string
              setEditData({ ...editData, userId: e.target.value });
            }}
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
          {errors?.userId && <FormHelperText>{errors.userId}</FormHelperText>}
        </FormControl>
      </TableCell>

      {/* Save/Cancel Buttons */}
      <TableCell>
        <Button size="small" variant="contained" onClick={onSave}>
          Save
        </Button>
        <Button size="small" onClick={onCancel}>
          Cancel
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default InlineEditRow;
