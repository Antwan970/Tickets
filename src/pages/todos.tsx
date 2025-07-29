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
} from '@mui/material';
import type { Todo } from '../type/Todo';

const Todos: React.FC = () => {
  const [todos, setTodos] = useState<Todo[] | null>(null); 
  const [search, setSearch] = useState('');
  const [property, setProperty] = useState<'id' | 'todo' | 'userId'>('todo');
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [error, setError] = useState<string | null>(null);

  
  if (todos === null) {
    fetch('https://dummyjson.com/todos')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load todos');
        return res.json();
      })
      .then((data) => {
        setTodos(data.todos);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError('Failed to load todos.');
      });

    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Loading Todos...
        </Typography>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const filteredTodos = todos.filter((todo) =>
    todo[property].toString().toLowerCase().includes(search.toLowerCase())
  );

  const paginatedTodos = filteredTodos.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Todos List
      </Typography>

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
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTodos.map((todo) => (
              <TableRow key={todo.id}>
                <TableCell>{todo.id}</TableCell>
                <TableCell>{todo.todo}</TableCell>
                <TableCell>{todo.completed ? '✅' : '❌'}</TableCell>
                <TableCell>{todo.userId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filteredTodos.length}
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