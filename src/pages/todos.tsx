// src/pages/Todos.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Paper,
  Select, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, TextField, Typography, Tooltip, Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTodos } from '../services/TodoGraphql'; // Now GraphQL version
import type { todo } from '../type/Todo';

const Todos: React.FC = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [property, setProperty] = useState<'id' | 'todo' | 'userId'>('todo');
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editableTodos, setEditableTodos] = useState<Record<number, todo>>({});
  const [editErrors, setEditErrors] = useState<Record<number, { todo?: string; userId?: string }>>({});
  const [newRow, setNewRow] = useState<todo | null>(null);
  const [newRowErrors, setNewRowErrors] = useState<{ todo?: string; userId?: string }>({});
  const [viewedTodo, setViewedTodo] = useState<todo | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch todos via GraphQL
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['todos', currentPage, rowsPerPage, debouncedSearch, property],
    queryFn: () => fetchTodos(currentPage, rowsPerPage, debouncedSearch, property),
    keepPreviousData: true,
  });

  // Delete mutation (REST)
  const deleteTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`http://localhost:1337/api/todos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  // Update mutation (REST)
  const updateTodoMutation = useMutation({
    mutationFn: async (todo: todo) => {
      const res = await fetch(`http://localhost:1337/api/todos/${todo.documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            todo: todo.todo,
            completed: todo.completed,
            userId: todo.userId,
          },
        }),
      });
      if (!res.ok) throw new Error('Failed to update todo');
      return res.json();
    },
    onSuccess: () => {
      setEditingId(null);
      setEditableTodos({});
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setSnackbarMessage('Todo updated successfully');
    },
  });

  // Add mutation (REST)
  const addTodoMutation = useMutation({
    mutationFn: async (todo: Omit<todo, 'id'>) => {
      const res = await fetch(`http://localhost:1337/api/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: todo }),
      });
      if (!res.ok) throw new Error('Failed to add todo');
      return res.json();
    },
    onSuccess: () => {
      setNewRow(null);
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setSnackbarMessage('New todo added successfully');
    },
  });

  const handleChangePage = (_: unknown, newPage: number) => setCurrentPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(0);
  };

  const handleEditChange = (id: number, field: keyof todo, value: string | boolean | number) => {
    setEditableTodos((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));

    setEditErrors((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...(field === 'todo' && typeof value === 'string' && value.trim() === ''
          ? { todo: 'Todo is required' }
          : { todo: undefined }),
        ...(field === 'userId' && (isNaN(Number(value)) || Number(value) <= 0)
          ? { userId: 'User ID must be a positive number' }
          : { userId: undefined }),
      },
    }));
  };

  const handleEditStart = (todo: todo) => {
    setEditingId(todo.id);
    setEditableTodos({ [todo.id]: { ...todo } });
    setEditErrors({});
  };

  const handleEditSave = (id: number) => {
    const updatedTodo = editableTodos[id];
    const errors: { todo?: string; userId?: string } = {};

    if (!updatedTodo.todo.trim()) errors.todo = 'Todo is required';
    if (isNaN(updatedTodo.userId) || updatedTodo.userId <= 0)
      errors.userId = 'User ID must be a positive number';

    const isDuplicateUserId = data?.todos?.some(
      (t: todo) => t.userId === updatedTodo.userId && t.id !== id
    );
    if (isDuplicateUserId) errors.userId = 'User ID must be unique';

    if (Object.keys(errors).length > 0) {
      setEditErrors((prev) => ({ ...prev, [id]: errors }));
      return;
    }

    updateTodoMutation.mutate(updatedTodo);
  };

  if (isLoading && !data) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5">Loading Todos...</Typography>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{(error as Error).message}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Todos List</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setNewRow({
              id: 0,
              todo: '',
              completed: false,
              userId: undefined as unknown as number,
            });
            setNewRowErrors({});
          }}
        >
          Add New Todo
        </Button>
      </Box>

      {/* Search & Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Search"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FormControl fullWidth>
          <InputLabel>Filter By</InputLabel>
          <Select
            value={property}
            onChange={(e) => setProperty(e.target.value as 'id' | 'todo' | 'userId')}
            label="Filter By"
          >
            <MenuItem value="id">ID</MenuItem>
            <MenuItem value="todo">Todo</MenuItem>
            <MenuItem value="userId">User ID</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Todo</b></TableCell>
                <TableCell><b>Completed</b></TableCell>
                <TableCell><b>User ID</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* New row */}
              {newRow && (
                <TableRow>
                  <TableCell>New</TableCell>
                  <TableCell>
                    <TextField
                      value={newRow.todo}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewRow({ ...newRow, todo: value });
                        setNewRowErrors((prev) => ({
                          ...prev,
                          todo: value.trim() === '' ? 'Todo is required' : undefined,
                        }));
                      }}
                      error={!!newRowErrors.todo}
                      helperText={newRowErrors.todo}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={newRow.completed}
                      onChange={(e) => setNewRow({ ...newRow, completed: e.target.checked })}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={newRow.userId ?? ''}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setNewRow({ ...newRow, userId: value });
                        setNewRowErrors((prev) => ({
                          ...prev,
                          userId:
                            isNaN(value) || value <= 0
                              ? 'User ID must be a positive number'
                              : data?.todos?.some((t: todo) => t.userId === value)
                              ? 'User ID must be unique'
                              : undefined,
                        }));
                      }}
                      onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                      type="number"
                      error={!!newRowErrors.userId}
                      helperText={newRowErrors.userId}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => {
                        const errors: { todo?: string; userId?: string } = {};
                        if (!newRow.todo.trim()) errors.todo = 'Todo is required';
                        if (!newRow.userId || isNaN(newRow.userId) || newRow.userId <= 0) {
                          errors.userId = 'User ID must be a positive number';
                        } else if (data?.todos?.some((t: todo) => t.userId === newRow.userId)) {
                          errors.userId = 'User ID must be unique';
                        }
                        if (Object.keys(errors).length > 0) {
                          setNewRowErrors(errors);
                          return;
                        }
                        addTodoMutation.mutate({
                          todo: newRow.todo.trim(),
                          completed: newRow.completed,
                          userId: newRow.userId,
                        });
                      }}
                    >
                      Save
                    </Button>
                    <Button size="small" onClick={() => setNewRow(null)}>Cancel</Button>
                  </TableCell>
                </TableRow>
              )}

              {/* Existing rows */}
              {!isFetching && data?.todos?.map((todo: todo) => (
                <TableRow key={todo.id}>
                  <TableCell>{todo.id}</TableCell>
                  <TableCell>
                    {editingId === todo.id ? (
                      <TextField
                        value={editableTodos[todo.id]?.todo ?? ''}
                        onChange={(e) => handleEditChange(todo.id, 'todo', e.target.value)}
                        error={!!editErrors[todo.id]?.todo}
                        helperText={editErrors[todo.id]?.todo}
                        size="small"
                      />
                    ) : todo.todo}
                  </TableCell>
                  <TableCell>
                    {editingId === todo.id ? (
                      <Checkbox
                        checked={editableTodos[todo.id]?.completed ?? false}
                        onChange={(e) => handleEditChange(todo.id, 'completed', e.target.checked)}
                      />
                    ) : todo.completed ? '✅' : '❌'}
                  </TableCell>
                  <TableCell>
                    {editingId === todo.id ? (
                      <TextField
                        value={editableTodos[todo.id]?.userId ?? ''}
                        onChange={(e) => handleEditChange(todo.id, 'userId', Number(e.target.value))}
                        onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                        type="number"
                        error={!!editErrors[todo.id]?.userId}
                        helperText={editErrors[todo.id]?.userId}
                        size="small"
                      />
                    ) : todo.userId}
                  </TableCell>
                  <TableCell>
                    {editingId === todo.id ? (
                      <>
                        <Button size="small" onClick={() => handleEditSave(todo.id)}>Save</Button>
                        <Button size="small" onClick={() => setEditingId(null)}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <Button size="small" onClick={() => handleEditStart(todo)}>Edit</Button>
                        <Tooltip title="View">
                          <IconButton size="small" color="info" onClick={() => setViewedTodo(todo)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              if (window.confirm('Are you sure?')) {
                                deleteTodoMutation.mutate(todo.documentId);
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={data?.total ?? 0}
          page={currentPage}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* View Dialog */}
      <Dialog open={!!viewedTodo} onClose={() => setViewedTodo(null)}>
        <DialogTitle>Todo Details</DialogTitle>
        <DialogContent dividers>
          <Typography><strong>ID:</strong> {viewedTodo?.id}</Typography>
          <Typography><strong>Todo:</strong> {viewedTodo?.todo}</Typography>
          <Typography><strong>Completed:</strong> {viewedTodo?.completed ? '✅ Yes' : '❌ No'}</Typography>
          <Typography><strong>User ID:</strong> {viewedTodo?.userId}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewedTodo(null)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default Todos;
