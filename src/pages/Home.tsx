/*import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  TablePagination,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

const HomePage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [property, setProperty] = useState<'id' | 'username' | 'email'>('username');
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch('https://dummyjson.com/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await res.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchUsers();
  }, [navigate]);

  const filteredUsers = users.filter((user) =>
    user[property]?.toString().toLowerCase().includes(search.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
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
        User List
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
            onChange={(e) => setProperty(e.target.value as 'id' | 'username' | 'email')}
          >
            <MenuItem value="id">ID</MenuItem>
            <MenuItem value="username">Username</MenuItem>
            <MenuItem value="email">Email</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Username</b></TableCell>
              <TableCell><b>Email</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filteredUsers.length}
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

export default HomePage;
*/