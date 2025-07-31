import React, { useState } from 'react';
import {
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Button
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import type { Todo } from '../type/Todo';

const fetchTodos = async (
  page: number,
  limit: number,
  token: string | null
): Promise<{ todos: Todo[]; total: number }> => {
  const skip = page * limit;
  const res = await fetch(`https://dummyjson.com/auth/todos?limit=${limit}&skip=${skip}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch todos');

  return res.json();
};

const Todos: React.FC = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const [search, setSearch] = useState('');
  const [property, setProperty] = useState<'id' | 'todo' | 'userId'>('todo');
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['todos', currentPage, rowsPerPage],
    queryFn: () => fetchTodos(currentPage, rowsPerPage, token),
    enabled: !!token,
  });

  const handleChangePage = (_: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  if (!token) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">You are not authenticated.</Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Loading Todos...
        </Typography>
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

  const filteredTodos = data?.todos?.filter((todo) =>
    todo[property].toString().toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Todos List</Typography>
        <Button
          component={Link}
          to="/new-todo"
          variant="contained"
          color="primary"
        >
          Add New Todo
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Search"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="filter-label">Filter By</InputLabel>
          <Select
            labelId="filter-label"
            value={property}
            label="Filter By"
            onChange={(e) => setProperty(e.target.value as 'id' | 'todo' | 'userId')}
          >
            <MenuItem value="id">ID</MenuItem>
            <MenuItem value="todo">Todo</MenuItem>
            <MenuItem value="userId">User ID</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper elevation={2}>
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
  {filteredTodos.map((todo) => (
    <TableRow key={todo.id}>
      <TableCell>{todo.id}</TableCell>
      <TableCell>{todo.todo}</TableCell>
      <TableCell>{todo.completed ? '✅' : '❌'}</TableCell>
      <TableCell>{todo.userId}</TableCell>
      <TableCell>
        <Button
          variant="outlined"
          color="primary"
          component={Link}
          to={`/edit-todo/${todo.id}`}
        >
          Edit
        </Button>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

        </Table>

        <TablePagination
          component="div"
          count={Number(data?.total)}
          page={currentPage}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>
    </Box>
  );
};

export default Todos;
