import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, TextField,
  Box, FormControl, InputLabel, Select, MenuItem,
  TablePagination
} from '@mui/material';

import type { Employee } from '../type/User';

const HomePage: React.FC = () => {
  const [users, setUsers] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [attribute, setAttribute] = useState<'name' | 'email' | 'id'>('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

 useEffect(() => {
  fetch("http://localhost:1337/api/employees")
    .then((res) => res.json())
    .then((data) => {
      setUsers(data.data as Employee[]); 
    })
    .catch((err) => console.error("Error fetching employees:", err));
}, []);



  const filteredUsers = users.filter((user) => {
    const valueToCheck =
      attribute === 'name'
        ? `${user.FirstName} ${user.LastName}`
        : attribute === 'email'
        ? user.Email
        : String(user.id);

    return valueToCheck.toLowerCase().includes(search.toLowerCase());
  });

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
  
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Users
        </Typography>
        <Typography variant="body2" gutterBottom>
          List of users
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
          <TextField
            label={`Search by ${attribute}`}
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Attribute</InputLabel>
            <Select
              value={attribute}
              label="Attribute"
              onChange={(e) => setAttribute(e.target.value as 'name' | 'email' | 'id')}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="id">ID</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Age</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.FirstName}</TableCell>
                  <TableCell>{user.LastName}</TableCell>
                  <TableCell>{user.Username}</TableCell>
                  <TableCell>{user.Email}</TableCell>
                  <TableCell>{user.Age}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Rows per page:"
          />
        </TableContainer>
      </Box>
   
  );
};

export default HomePage;
