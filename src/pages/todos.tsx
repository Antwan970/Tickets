import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, FormControl, InputLabel,
  Select, MenuItem, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, Paper, TablePagination, Button,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Snackbar, CircularProgress
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchTodos, updateTodo, addTodo, deleteTodo } from '../services/TodoGraphql';

import InlineEditRow from '../components/editTodo';
import InlineAddRow from '../components/addTodo';
import type { Todo } from '../type/Todo';

// Chart.js for Pie Chart
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import { fetchUsers } from '../services/users';
import type { Employee } from '../type/User';

ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

const Todos: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [property, setProperty] = useState<'id' | 'todo' | 'userId'>('id');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Todo>>({});
  const [newTodo, setNewTodo] = useState<Partial<Todo>>({ todo: "", completed: false, userId: "" });
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  const [viewedTodo, setViewedTodo] = useState<Todo & { numericId?: number } | null>(null);
  const [editErrors, setEditErrors] = useState<{ todo?: string; userId?: string }>({});
  const [addErrors, setAddErrors] = useState<{ todo?: string; userId?: string }>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const queryClient = useQueryClient();

  // Load employees
  useEffect(() => {
    (async () => {
      const data = await fetchUsers();
      setEmployees(Array.isArray(data) ? data : []);
    })();
  }, []);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput), 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Query todos
  const { data, isLoading, isInitialLoading, isError } = useQuery({
    queryKey: ['todos', page, rowsPerPage, debouncedSearch, property],
    queryFn: () => fetchTodos(page + 1, rowsPerPage, debouncedSearch, property),
    keepPreviousData: true,
  });

  const todos = data?.todos ?? [];

  // Pagination
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // Edit
  const handleSaveEdit = async (documentId: string) => {
    const errors: { todo?: string; userId?: string } = {};
    if (!editData.todo || editData.todo.trim() === '') {
      errors.todo = 'Todo content is required.';
    }
    if (!editData.userId || typeof editData.userId !== 'string') {
      errors.userId = 'User selection is required.';
    }
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    setEditErrors({});
    try {
      await updateTodo(documentId, editData as Todo);
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setSnackbarMessage('Todo updated successfully');
    } catch (err) {
      console.error(err);
    }
  };

  // Add
  const handleAddTodo = async (newTodo: Omit<Todo, 'id'>) => {
    const errors: { todo?: string; userId?: string } = {};
    if (!newTodo.todo || newTodo.todo.trim() === '') {
      errors.todo = 'Todo content is required.';
    }
    if (!newTodo.userId || typeof newTodo.userId !== 'string') {
      errors.userId = 'User selection is required.';
    }
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }
    setAddErrors({});
    try {
      await addTodo(newTodo, token);
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setIsAdding(false);
      setNewTodo({ todo: "", completed: false, userId: "" }); // ✅ reset
      setSnackbarMessage('New todo added successfully');
    } catch (err) {
      console.error('Add todo failed:', err);
      setSnackbarMessage('Failed to add todo');
    }
  };

  // Delete
  const handleDelete = useMutation({
    mutationFn: async (documentId: string) => {
      await deleteTodo(documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setSnackbarMessage('Todo deleted successfully');
    },
  });

  if (isInitialLoading || isLoading) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography sx={{ mb: 2 }}>Loading...</Typography>
        <CircularProgress />
      </Box>
    );
  }
  if (isError) {
    return (
      <Box>
        <Typography color="error" sx={{ p: 4 }}>
          Failed to load todos.
        </Typography>
      </Box>
    );
  }

  // Pie Chart data
  const completedCount = todos.filter((t: Todo) => t.completed).length;
  const notCompletedCount = todos.length - completedCount;
  const assignedCount = todos.filter((t: Todo) => t.userId).length;
  const unassignedCount = todos.length - assignedCount;

  const pieDataStatus = {
    labels: ['Completed', 'Not Completed'],
    datasets: [
      {
        label: 'Todos Status',
        data: [completedCount, notCompletedCount],
        backgroundColor: ["#006400", "#8B0000"],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  };

  const pieDataAssigned = {
    labels: ['Assigned', 'Unassigned'],
    datasets: [
      {
        label: 'Todos Assigned',
        data: [assignedCount, unassignedCount],
        backgroundColor: ["#006400", "#8B0000"],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.raw || 0}`,
        },
      },
    },
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 'bold', mb: 3, borderBottom: '3px solid #1976d2', pb: 1 }}
      >
        Todos
      </Typography>

      {/* Charts */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, my: 4, flexWrap: 'wrap' }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, textAlign: 'center', width: 320 }}>
          <Typography variant="h6" gutterBottom>
            Todos Percentages
          </Typography>
          <Box sx={{ width: 250, mx: 'auto' }}>
            <Pie data={pieDataStatus} options={pieOptions} />
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            {completedCount}/{completedCount + notCompletedCount} Completed
          </Typography>
          <Typography variant="body2">
            {notCompletedCount}/{completedCount + notCompletedCount} Not Completed
          </Typography>
        </Paper>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, textAlign: 'center', width: 320 }}>
          <Typography variant="h6" gutterBottom>
            Employees Assigned
          </Typography>
          <Box sx={{ width: 250, mx: 'auto' }}>
            <Pie data={pieDataAssigned} options={pieOptions} />
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            {assignedCount}/{assignedCount + unassignedCount} Assigned
          </Typography>
          <Typography variant="body2">
            {unassignedCount}/{assignedCount + unassignedCount} Unassigned
          </Typography>
        </Paper>
      </Box>

      {/* Search + Add */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={property}
            label="Filter"
            onChange={(e) => setProperty(e.target.value as 'id' | 'todo' | 'userId')}
          >
            <MenuItem value="id">ID</MenuItem>
            <MenuItem value="todo">Todo</MenuItem>
            <MenuItem value="userId">User</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          sx={{ ml: 'auto', border: '1px solid #1976d2' }}
          onClick={() => setIsAdding(true)}
        >
          + Add Todo
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Todo</TableCell>
              <TableCell>Completed</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isAdding && (
              <InlineAddRow
                newTodo={newTodo}
                setNewTodo={setNewTodo}
                onAdd={handleAddTodo}
                onCancel={() => {
                  setIsAdding(false);
                  setNewTodo({ todo: "", completed: false, userId: "" });
                  setAddErrors({});
                }}
                errors={addErrors}
                employees={employees || []}
              />
            )}
            {todos.map((t: Todo, index: number) => {
              const todoText = t.todo ?? '—';
              const completed = t.completed ?? false;
              const displayId = page * rowsPerPage + index + 1;
              return editingId === t.documentId ? (
                <InlineEditRow
                  key={t.documentId}
                  todo={{ ...t }}
                  editData={editData}
                  setEditData={setEditData}
                  onSave={() => handleSaveEdit(t.documentId)}
                  onCancel={() => setEditingId(null)}
                  errors={editErrors}
                  employees={employees || []}
                />
              ) : (
                <TableRow key={t.documentId}>
                  <TableCell>{displayId}</TableCell>
                  <TableCell>{todoText}</TableCell>
                  <TableCell>{completed ? '✅' : '❌'}</TableCell>
                  <TableCell>
                    {t.userId ? `${t.userId.FirstName} ${t.userId.LastName}` : "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ border: '1px solid #1976d2', mr: 1 }}
                      onClick={() => {
                        setEditingId(t.documentId);
                        setEditData({ todo: todoText, completed, userId: t.userId?.documentId || "" });
                      }}
                    >
                      Edit
                    </Button>
                    <Tooltip title="View">
                      <IconButton size="small" onClick={() => setViewedTodo({ ...t, numericId: displayId })}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete.mutate(t.documentId)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data?.pageInfo?.total || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[3, 5, 10, 50]}
        />
      </TableContainer>

      {/* View Dialog */}
      <Dialog open={!!viewedTodo} onClose={() => setViewedTodo(null)}>
        <DialogTitle>Todo Details</DialogTitle>
        <DialogContent dividers>
          <Typography><strong>ID:</strong> {viewedTodo?.numericId}</Typography>
          <Typography><strong>Todo:</strong> {viewedTodo?.todo}</Typography>
          <Typography><strong>Completed:</strong> {viewedTodo?.completed ? '✅ Yes' : '❌ No'}</Typography>
          <Typography><strong>User:</strong> {viewedTodo?.userId ? `${viewedTodo.userId.FirstName} ${viewedTodo.userId.LastName}` : '-'}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewedTodo(null)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
